import express from "express";
import {
  addShippingSales,
  getShippingSales,
  updateShippingSales,
  deleteShippingSales,
} from "../../controller/admin/shippingSalesController.js";

const router = express.Router();

router.post("/", addShippingSales);
router.get("/", getShippingSales);
router.put("/:id", updateShippingSales);
router.delete("/:id", deleteShippingSales);

export default router;
