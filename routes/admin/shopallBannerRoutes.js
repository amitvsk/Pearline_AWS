import express from "express";
import multer from "multer";
import { uploadBanner, getBanner, updateBanner, deleteBanner } from "../../controller/admin/shopallBannerController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload arrival banner (both desktop and mobile images)
router.post("/", 
  upload.fields([
    { name: "image", maxCount: 1 },      // Desktop image
    { name: "mobImage", maxCount: 1 }    // Mobile image
  ]), 
  uploadBanner
);

// Get latest arrival banner
router.get("/", getBanner);

// Get all arrival banners
router.get("/all", getBanner);

// Update arrival banner (update either or both images)
router.put("/:id",
  upload.fields([
    { name: "image", maxCount: 1 },      // Optional desktop image update
    { name: "mobImage", maxCount: 1 }    // Optional mobile image update
  ]),
  updateBanner
);

// Delete arrival banner
router.delete("/:id", deleteBanner);

export default router;
