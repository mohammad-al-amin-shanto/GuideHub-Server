// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import asyncHandler from "../middleware/asyncHandler";

// ENV + CONSTANTS
const COOKIE_NAME = process.env.COOKIE_NAME || "token";

// Ensure SECRET is properly cast as jwt.Secret
const JWT_SECRET: Secret =
  (process.env.JWT_SECRET as Secret) || "dev_secret_change_me";

// Token expiration (TS-safe)
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as any) || "7d";

const DEFAULT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const REMEMBER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// --------------------------------------------------------
// COOKIE OPTIONS
// --------------------------------------------------------
function cookieOptions(maxAge = DEFAULT_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge,
    path: "/",
  };
}

// --------------------------------------------------------
// TOKEN HELPERS
// --------------------------------------------------------
function signToken(payload: object) {
  const opts: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, opts);
}

// --------------------------------------------------------
// POST /api/auth/register
// SAVE ROLE CORRECTLY 🔥
// --------------------------------------------------------
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body || {};
  const emailNormalized = email?.toLowerCase();

  if (!emailNormalized || !password)
    return res.status(400).json({
      success: false,
      message: "Email & password required",
    });

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  const existing = await User.findOne({ email: emailNormalized }).lean().exec();

  if (existing)
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });

  // 🔥 FIX: SAVE ROLE FROM CLIENT
  const allowedRoles = ["tourist", "guide"];
  const safeRole = allowedRoles.includes(role) ? role : "tourist";

  const user = new User({
    name,
    email: emailNormalized,
    password,
    role: safeRole,
  });

  await user.save();

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
  });

  res.cookie(COOKIE_NAME, token, cookieOptions());

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// --------------------------------------------------------
// POST /api/auth/login
// RETURNS ROLE 🔥
// --------------------------------------------------------
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, remember } = req.body || {};
  const emailNormalized = email?.toLowerCase();

  if (!emailNormalized || !password)
    return res.status(400).json({
      success: false,
      message: "Email & password required",
    });

  const user = await User.findOne({ email: emailNormalized })
    .select("+password")
    .exec();

  if (!user)
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });

  const isMatch =
    typeof (user as any).comparePassword === "function"
      ? await (user as any).comparePassword(password)
      : await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
  });

  const opts = cookieOptions(
    remember ? REMEMBER_COOKIE_MAX_AGE : DEFAULT_COOKIE_MAX_AGE
  );

  res.cookie(COOKIE_NAME, token, opts);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// --------------------------------------------------------
// POST /api/auth/logout
// --------------------------------------------------------
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: 0,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// --------------------------------------------------------
// GET /api/auth/me
// RETURNS ROLE 🔥
// --------------------------------------------------------
export const me = asyncHandler(async (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  if (!req.user)
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });

  res.json({
    success: true,
    message: "User fetched successfully",
    data: {
      user: req.user,
    },
  });
});
