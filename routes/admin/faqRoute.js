import express from "express";
import {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
} from "../../controller/admin/faqController.js";

const router = express.Router();

router.post("/", createFaq);     // Create FAQ
router.get("/", getFaqs);        // Get all FAQs
router.get("/:id", getFaqById);  // Get single FAQ
router.put("/:id", updateFaq);   // Update FAQ
router.delete("/:id", deleteFaq);// Delete FAQ

export default router;
