import { Request, Response } from "express";
import Listing from "../models/Listing.model";
import asyncHandler from "../middleware/asyncHandler";

export const createListing = asyncHandler(
  async (req: Request, res: Response) => {
    const host = req.user?._id;
    if (!host) return res.status(401).json({ message: "Not authorized" });

    const { title, description, price, city, images } = req.body;
    const listing = new Listing({
      title,
      description,
      price,
      city,
      images,
      host,
    });
    await listing.save();
    res.status(201).json({ listing });
  }
);

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await Listing.find().populate("host", "name email");
  res.json({ listings });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("host", "name email");
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  res.json({ listing });
});

export const updateListing = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (!req.user || listing.host.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    Object.assign(listing, req.body);
    await listing.save();
    res.json({ listing });
  }
);

export const deleteListing = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (!req.user || listing.host.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    await listing.deleteOne();
    res.json({ message: "Deleted" });
  }
);
