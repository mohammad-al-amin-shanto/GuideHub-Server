import mongoose, { Document, Schema } from "mongoose";

export interface BookingDocument extends Document {
  listing: mongoose.Types.ObjectId;
  tourist: mongoose.Types.ObjectId;
  guide: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  pricePerDay: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: "unpaid" | "paid" | "refunded";
}

const BookingSchema = new Schema<BookingDocument>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    tourist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    guide: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    pricePerDay: {
      type: Number,
      required: true,
    },

    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// Compound index to prevent overlapping bookings
BookingSchema.index(
  { listing: 1, startDate: 1, endDate: 1 },
  {
    unique: false,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
  }
);

// Index to optimize queries for overlapping bookings
BookingSchema.index({
  listing: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

// 🚀 Speed up dashboard queries
BookingSchema.index({ tourist: 1 });
BookingSchema.index({ guide: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ paymentStatus: 1, status: 1 });

// Pre-save hook to normalize dates to UTC midnight
BookingSchema.pre("save", function (next) {
  if (this.isModified("startDate")) {
    this.startDate.setUTCHours(0, 0, 0, 0);
  }
  if (this.isModified("endDate")) {
    this.endDate.setUTCHours(0, 0, 0, 0);
  }
  next();
});

// Pre-validate hook to ensure startDate is before endDate
BookingSchema.pre("validate", function (next) {
  if (this.startDate >= this.endDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

export default mongoose.models.Booking ||
  mongoose.model<BookingDocument>("Booking", BookingSchema);
