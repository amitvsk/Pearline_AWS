import express from "express";
import multer from "multer";
import { createTestimonial, getTestimonials, getTestimonialsById, updateTestimonial, deleteTestimonial } from "../../controller/admin/testimonialController.js";

const router = express.Router();
const upload = multer(); // memory storage for S3 upload

router.get("/", getTestimonials);
router.post("/", upload.single("image"), createTestimonial);
router.put("/:id", upload.single("image"), updateTestimonial);
router.get("/:id", getTestimonialsById);
router.delete("/:id", deleteTestimonial);

export default router;
