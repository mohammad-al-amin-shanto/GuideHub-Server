import { Router } from "express";
import { getGuideStats } from "../controllers/guides.controller";
import { protect } from "../middleware/auth";
import { listGuides } from "./../controllers/guides.controller";

const router = Router();

router.get("/", listGuides);
router.get("/stats/:id", protect, getGuideStats);

export default router;
