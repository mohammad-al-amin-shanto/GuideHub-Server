import mongoose, { Document, Schema } from "mongoose";

export interface GuideArea {
  name: string;
  lat: number;
  lng: number;
  visitTime: number;
}

export interface GuideDocument extends Document {
  name: string;
  slug: string;

  avatar?: string;
  coverImage?: string;

  bio?: string;
  specialty?: string;
  tags?: string[];

  city?: string;
  country?: string;
  location?: string;

  languages?: string[];

  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;

  pricePerHour?: number;
  currency?: string;

  areasCovered?: GuideArea[];

  createdAt?: Date;
  updatedAt?: Date;
}

const GuideSchema = new Schema<GuideDocument>(
  {
    name: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    avatar: String,
    coverImage: String,

    bio: { type: String, trim: true },
    specialty: { type: String, trim: true },

    tags: [{ type: String, trim: true }],

    city: { type: String, trim: true },
    country: { type: String, trim: true },
    location: { type: String, trim: true },

    languages: [{ type: String, trim: true }],

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    pricePerHour: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },

    areasCovered: [
      {
        name: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        visitTime: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true, collection: "Guides" }
);

export default mongoose.models.Guide ||
  mongoose.model<GuideDocument>("Guide", GuideSchema);
