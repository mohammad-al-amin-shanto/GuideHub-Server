import { Request, Response } from "express";
import Booking from "../models/Booking.model";
import Listing from "../models/Listing.model";
import asyncHandler from "../middleware/asyncHandler";
import mongoose from "mongoose";
import { BOOKING_STATUSES, BOOKING_TRANSITIONS } from "../utils/bookingStatus";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user?.role !== "tourist") {
      return res.status(403).json({
        success: false,
        message: "Only tourists can book tours",
      });
    }

    const { listingId, startDate, endDate } = req.body;

    // Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (!listing.guide) {
      return res.status(500).json({
        success: false,
        message: "Listing has no assigned guide",
      });
    }

    // Prevent self-booking
    if (listing.guide.toString() === user.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own tour",
      });
    }

    // Prevent duplicate active booking
    const existingBooking = await Booking.findOne({
      tourist: user,
      listing: listing._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this tour",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Validate listing price
    if (
      typeof listing.price !== "number" ||
      Number.isNaN(listing.price) ||
      listing.price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing price",
      });
    }

    // Calculate total price
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const MAX_BOOKING_DAYS = Number(process.env.MAX_BOOKING_DAYS || 30);

    if (days > MAX_BOOKING_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Booking duration cannot exceed ${MAX_BOOKING_DAYS} days`,
      });
    }

    const pricePerDay = listing.price;
    const totalPrice = pricePerDay * days;

    // -----------------------------------------
    // TRANSACTION-SAFE BOOKING CREATION
    // -----------------------------------------
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const overlappingBooking = await Booking.findOne(
        {
          listing: listing._id,
          status: { $in: ["pending", "confirmed"] },
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
        null,
        { session }
      );

      if (overlappingBooking) {
        throw Object.assign(
          new Error("This tour is already booked for the selected dates"),
          { status: 409 }
        );
      }

      const booking = new Booking({
        listing: listing._id,
        tourist: user,
        guide: listing.guide,
        startDate: start,
        endDate: end,
        // pricePerDay is stored to preserve historical pricing
        pricePerDay: listing.price,
        totalPrice,
        status: "pending" as const,
      });

      await booking.save({ session });
      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        message: "Booking request created",
        data: {
          booking: {
            id: booking._id,
            status: booking.status,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            listing: booking.listing,
          },
        },
      });
    } catch (err: any) {
      await session.abortTransaction();
      err.status = err.status || 500;
      throw err;
    } finally {
      session.endSession();
    }
  }
);

{
  /* 
 GET /api/bookings/me
  */
}

export const getUserBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user?._id;
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });

    if (req.user?.role !== "tourist") {
      return res.status(403).json({
        success: false,
        message: "Only tourists can view their bookings",
      });
    }

    const bookings = await Booking.find({
      tourist: user,
      status: { $ne: "cancelled" },
    })

      .populate({
        path: "listing",
        select: "title price guide",
        populate: {
          path: "guide",
          select: "name",
        },
      })
      .lean()
      .sort({ startDate: 1 });

    res.json({
      success: true,
      message: "User bookings fetched",
      data: { bookings },
    });
  }
);

{
  /* 
  GET /api/bookings/listing/:listingId
  */
}

export const getListingBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });

    if (user.role !== "guide") {
      return res.status(403).json({
        success: false,
        message: "Only guides can view listing bookings",
      });
    }

    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.guide.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not own this listing",
      });
    }

    const bookings = await Booking.find({
      listing: listingId,
      guide: user._id,
    })
      .populate("tourist", "name email")
      .lean()
      .select("startDate endDate status totalPrice paymentStatus tourist");

    res.json({
      success: true,
      message: "Bookings fetched",
      data: { bookings },
    });
  }
);

type UpdateBookingStatusBody = {
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params as { bookingId: string };
    const { status } = req.body as UpdateBookingStatusBody;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw Object.assign(new Error("Booking not found"), { status: 404 });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 🛑 VALID STATUS CHECK
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // 🔐 ROLE-BASED STATUS PERMISSIONS

    if (req.user.role === "tourist") {
      if (booking.tourist.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to modify this booking",
        });
      }

      if (!(booking.status === "pending" && status === "cancelled")) {
        return res.status(400).json({
          success: false,
          message: "Tourists can only cancel pending bookings",
        });
      }
    } else if (req.user.role === "guide") {
      if (booking.guide.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to modify this booking",
        });
      }

      if (!["confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status update for guide",
        });
      }
    } else if (req.user.role === "admin") {
      if (["confirmed", "completed"].includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Admins cannot advance booking states",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // ⏳ COMPLETION TIMELOCK

    if (status === "completed") {
      const now = new Date();
      if (booking.endDate > now) {
        return res.status(400).json({
          success: false,
          message: "Cannot complete booking before tour end date",
        });
      }
    }

    // ✂ TOURIST-INITIATED CANCELLATION
    if (
      req.user.role === "tourist" &&
      booking.tourist.toString() === req.user._id.toString() &&
      status === "cancelled" &&
      booking.status === "pending"
    ) {
      booking.status = "cancelled";

      // 💰 Refund handling (state-level)
      if (booking.paymentStatus === "paid") {
        booking.paymentStatus = "refunded";
      }

      await booking.save();

      return res.json({
        success: true,
        message: "Booking cancelled",
        data: { booking },
      });
    }

    // ❌ IMMUTABLE COMPLETED BOOKINGS
    if (booking.status === "completed" && status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    // 🔥 STATUS TRANSITION GUARD
    if (!BOOKING_TRANSITIONS[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`,
      });
    }

    if (booking.status === status) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${status}`,
      });
    }

    // 💰 PAYMENT-STATUS ENFORCEMENT
    // Tourist must complete payment before guide can confirm booking
    if (
      status === "confirmed" &&
      booking.paymentStatus !== "paid" &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be confirmed before payment",
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status}`,
      data: {
        booking: {
          id: booking._id,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
        },
      },
    });
  }
);
