import express from "express";
import multer from "multer";
import { uploadBanner, getBanner, updateBanner, deleteBanner } from "../../controller/admin/aboutBannerController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("banner"), uploadBanner);
router.get("/", getBanner);
router.put("/:id", upload.single("banner"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
