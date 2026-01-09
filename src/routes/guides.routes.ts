import { Router } from "express";
import { getGuideStats } from "../controllers/guides.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/stats/:id", protect, getGuideStats);

export default router;
