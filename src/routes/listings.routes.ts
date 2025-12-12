import { Router } from "express";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
} from "../controllers/listings.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getListings);
router.post("/", protect, createListing);
router.get("/:id", getListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
