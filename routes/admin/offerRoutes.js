import express from "express";
import multer from "multer";
import { uploadOffer, getOffer, updateOffer, deleteOffer } from "../../controller/admin/offerController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/", upload.single("offer"), uploadOffer);
router.get("/", getOffer);
router.put("/:id", upload.single("offer"), updateOffer);
router.delete("/:id", deleteOffer);

export default router;
