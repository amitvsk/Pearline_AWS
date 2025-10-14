import express from "express";
import multer from "multer";
import {
  uploadCollectionBanner,
  getCollectionBanner,
  getAllCollectionBanners,
  updateCollectionBanner,
  deleteCollectionBanner
} from "../../controller/admin/collectionBannerController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload collection banner (both desktop and mobile images)
router.post("/", 
  upload.fields([
    { name: "image", maxCount: 1 },      // Desktop image
    { name: "mobImage", maxCount: 1 }    // Mobile image
  ]), 
  uploadCollectionBanner
);

// Get latest collection banner
router.get("/", getCollectionBanner);

// Get all collection banners
router.get("/all", getAllCollectionBanners);

// Update collection banner (update either or both images)
router.put("/:id",
  upload.fields([
    { name: "image", maxCount: 1 },      // Optional desktop image update
    { name: "mobImage", maxCount: 1 }    // Optional mobile image update
  ]),
  updateCollectionBanner
);

// Delete collection banner
router.delete("/:id", deleteCollectionBanner);

export default router;