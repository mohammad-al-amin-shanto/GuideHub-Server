import { Router } from "express";
import {
  listGuides,
  getGuideBySlug,
  getGuideStats,
} from "../controllers/guides.controller";
import { protect } from "../middleware/auth";

const router = Router();

// List guides
router.get("/", listGuides);

// Guide stats (protected)
router.get("/stats/:id", protect, getGuideStats);

// Public guide profile (by slug)
router.get("/:slug", getGuideBySlug);

export default router;
