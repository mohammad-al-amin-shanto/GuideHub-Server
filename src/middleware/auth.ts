import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization!.split(" ")[1]
    : undefined;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "") as {
      id: string;
    };
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
