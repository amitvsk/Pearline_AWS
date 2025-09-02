import express from "express";
import multer from "multer";
import {
  uploadAbout,
  getAboutSections,
  getAboutById,
  updateAbout,
  deleteAbout
} from "../../controller/admin/aboutController.js";

const aboutRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create / Upload About Section
aboutRouter.post("/", upload.single("image"), uploadAbout);

// Get all sections
aboutRouter.get("/", getAboutSections);

// Get section by ID
aboutRouter.get("/:id", getAboutById);

// Update section
aboutRouter.put("/:id", upload.single("image"), updateAbout);

// Delete section
aboutRouter.delete("/:id", deleteAbout);

export default aboutRouter;
