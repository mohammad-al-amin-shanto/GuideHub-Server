import { Request, Response } from "express";
import User from "../models/User.model";
import asyncHandler from "../middleware/asyncHandler";

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const updates = req.body;
    // Prevent password update here (or handle separately)
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");
    res.json({ user });
  }
);
