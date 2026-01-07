import { Request, Response } from "express";
import Payment from "../models/Payment.model";
import Booking from "../models/Booking.model";
import stripeClient from "../utils/stripe";
import asyncHandler from "../middleware/asyncHandler";
import Stripe from "stripe";
import mongoose from "mongoose";
import logger from "./../utils/logger";

export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "tourist") {
      return res.status(403).json({
        success: false,
        message: "Only tourists can make payments",
      });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ownership check
    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not own this booking",
      });
    }

    // Booking state validation
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment is only allowed for pending bookings",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled booking",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    // Prevent duplicate payment records
    const existingPayment = await Payment.findOne({ booking: booking._id });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already initiated for this booking",
      });
    }

    const amountInCents = Math.round(booking.totalPrice * 100);
    const CURRENCY = process.env.PAYMENT_CURRENCY || "usd";

    const intent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: CURRENCY,
      metadata: {
        bookingId: booking._id.toString(),
        touristId: req.user._id.toString(),
      },
    });

    const payment = new Payment({
      booking: booking._id,
      amount: booking.totalPrice,
      status: "pending",
      stripeChargeId: intent.id,
    });

    await payment.save();

    res.json({
      success: true,
      message: "Payment intent created",
      data: {
        clientSecret: intent.client_secret,
      },
    });
  }
);

// We intentionally handle only:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// Other events are ignored safely

export const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    // 🔐 STEP 1: Verify webhook signature
    try {
      event = stripeClient.webhooks.constructEvent(
        req.body, // RAW body
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return res.status(400).json({ received: false });
    }

    // ✅ (event is verified)
    logger.info(`Stripe event received: ${event.type}`);

    // 🔁 STEP 2: Transaction-safe handling
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ PAYMENT SUCCESS
      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata?.bookingId;

        if (!bookingId) {
          throw new Error("Missing bookingId in metadata");
        }

        const booking = await Booking.findById(bookingId).session(session);
        const payment = await Payment.findOne({
          stripeChargeId: intent.id,
        }).session(session);

        // 🔁 Idempotency guard
        if (
          booking &&
          payment &&
          booking.paymentStatus !== "paid" &&
          payment.status !== "succeeded"
        ) {
          booking.paymentStatus = "paid";
          payment.status = "succeeded";

          await booking.save({ session });
          await payment.save({ session });
        }
      }

      // ❌ PAYMENT FAILED
      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object as Stripe.PaymentIntent;

        const payment = await Payment.findOne({
          stripeChargeId: intent.id,
        }).session(session);

        if (payment && payment.status !== "failed") {
          payment.status = "failed";
          await payment.save({ session });
        }
      }

      await session.commitTransaction();
      res.json({ received: true });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ received: false });
    } finally {
      session.endSession();
    }
  }
);
