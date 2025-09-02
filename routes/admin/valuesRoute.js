import express from "express";
import {
  createValue,
  getValues,
  getValueById,
  updateValue,
  deleteValue,
} from "../../controller/admin/valuesController.js";

const router = express.Router();

// CRUD Routes
router.post("/", createValue);       // Create
router.get("/", getValues);          // Get all
router.get("/:id", getValueById);    // Get one
router.put("/:id", updateValue);     // Update
router.delete("/:id", deleteValue);  // Delete

export default router;
