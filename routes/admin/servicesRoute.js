import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../../controller/admin/servicesController.js";

const router = express.Router();

router.post("/", createService);        // ➝ Add Service
router.get("/", getAllServices);        // ➝ Get All
router.get("/:id", getServiceById);     // ➝ Get by ID
router.put("/:id", updateService);      // ➝ Update
router.delete("/:id", deleteService);   // ➝ Delete

export default router;
