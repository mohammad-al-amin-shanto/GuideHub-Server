import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import CATEGORY_MAP from "../utils/categoryMap";
import GuideModel from "../models/Guide.model";

type GuideLean = {
  _id: string;
  name: string;
  slug: string;

  city?: string;
  country?: string;

  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;

  coverImage?: string;
  avatar?: string;

  bio?: string;
  specialty?: string;

  pricePerHour?: number;
  currency?: string;

  tags?: string[];
};

// GET /api/guides/:slug
export const getGuideBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const guide = await GuideModel.findOne({ slug })
      .select(
        "name slug city country rating reviewCount isVerified coverImage avatar bio specialty pricePerHour currency tags"
      )
      .lean<GuideLean>()
      .exec();

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    res.json({
      success: true,
      guide: {
        id: guide._id,
        slug: guide.slug,
        name: guide.name,
        city: guide.city,
        country: guide.country,
        rating: guide.rating,
        reviewCount: guide.reviewCount,
        isVerified: guide.isVerified,
        coverImage: guide.coverImage,
        avatar: guide.avatar,
        bio: guide.bio,
        specialty: guide.specialty,
        pricePerHour: guide.pricePerHour,
        currency: guide.currency,
        tags: guide.tags,
      },
    });
  }
);

// GET /api/guides (with optional query: category, tag, q, city, limit, skip)
export const listGuides = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.query as Record<string, any>;

  const category = raw.category
    ? String(raw.category).trim().toLowerCase()
    : undefined;
  const tag = raw.tag ? String(raw.tag).trim() : undefined;
  const q = raw.q ? String(raw.q).trim() : undefined;
  const city = raw.city ? String(raw.city).trim() : undefined;
  const limit = Math.min(Math.max(Number(raw.limit) || 20, 1), 100);
  const skip = Math.max(Number(raw.skip) || 0, 0);

  const filter: any = {};

  // Category -> tags mapping (OR semantics: any mapped tag matches)
  if (category) {
    const mapped = CATEGORY_MAP[category];
    if (mapped && mapped.length > 0) {
      filter.tags = { $in: mapped };
    }
  }
  if (tag) {
    if (filter.tags && filter.tags.$in) {
      // union (OR) behavior:
      filter.tags = { $in: [...new Set([...(filter.tags.$in || []), tag])] };
    } else {
      filter.tags = { $in: [tag] };
    }
  }

  if (city) filter.city = city;

  if (q) {
    // Use regex search across several text-like fields
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape user input
    filter.$or = [
      { name: { $regex: re } },
      { bio: { $regex: re } },
      { tags: { $regex: re } },
      { location: { $regex: re } },
    ];
  }

  const guides = await GuideModel.find(filter)
    .sort({ rating: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "name slug city country rating reviewCount isVerified coverImage avatar specialty"
    )
    .lean()
    .exec();

  res.json({ guides });
});

// GET /api/guide/stats/:id
export const getGuideStats = asyncHandler(
  async (req: Request, res: Response) => {
    const guideId = req.params.id;

    if (!guideId) {
      return res.status(400).json({
        success: false,
        message: "Guide ID is required",
      });
    }

    // 🔹 Placeholder stats (expand later)
    res.json({
      success: true,
      data: {
        totalBookings: 0,
        totalEarnings: 0,
        rating: 0,
        recentActivity: [],
      },
    });
  }
);

// GET /api/guides/:id
export const getGuideById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const guide = await GuideModel.findById(id)
      .select("name location rating img city price_per_hour bio tags specialty")
      .lean<GuideLean>()
      .exec();

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    type GuideLean = {
      _id: string;
      name: string;
      location?: string;
      rating?: number;
      img?: string;
      city?: string;
      bio?: string;
      specialty?: string;
      price_per_hour?: number;
      tags?: string[];
    };

    res.json({
      success: true,
      guide: {
        id: guide._id,
        name: guide.name,
        location: guide.location,
        rating: guide.rating,
        img: guide.img,
        city: guide.city,
        bio: guide.bio,
        specialty: guide.specialty,
        pricePerHour: guide.price_per_hour,
        tags: guide.tags,
      },
    });
  }
);
