import express from "express";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "../../controller/user/addressController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.get("/", authMiddleware, getUserAddresses);
router.get("/default", authMiddleware, getDefaultAddress);
router.post("/", authMiddleware, addAddress);
router.put("/:addressId", authMiddleware, updateAddress);
router.delete("/:addressId", authMiddleware, deleteAddress);
router.patch("/:addressId/default", authMiddleware, setDefaultAddress);

export default router;
