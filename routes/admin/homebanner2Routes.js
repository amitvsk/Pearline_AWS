import express from "express";
import multer from "multer";
import { uploadBanner, getBanner, updateBanner, deleteBanner } from "../../controller/admin/homebanner2Controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), uploadBanner);
router.get("/", getBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
