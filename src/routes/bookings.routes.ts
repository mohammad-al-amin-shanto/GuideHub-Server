import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getListingBookings,
  updateBookingStatus,
} from "../controllers/bookings.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createBooking);
router.get("/me", protect, getUserBookings);
router.get("/listing/:listingId", getListingBookings);
router.patch("/:bookingId/status", protect, updateBookingStatus);

export default router;
