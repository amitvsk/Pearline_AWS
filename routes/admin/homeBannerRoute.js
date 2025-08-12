import express from "express";
import multer from "multer";
import { uploadBanners } from "../controllers/bannerController.js";

const homeBannerRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

homeBannerRouter.post(
  "/upload",
  upload.fields([
    { name: "banner1", maxCount: 1 },
    { name: "banner2", maxCount: 1 },
    { name: "banner3", maxCount: 1 }
  ]),
  uploadBanners
);

export default homeBannerRouter;
