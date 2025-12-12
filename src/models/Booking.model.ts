import mongoose, { Document, Schema } from "mongoose";

export interface BookingDocument extends Document {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<BookingDocument>("Booking", BookingSchema);
