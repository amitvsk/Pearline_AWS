import express from "express";
import {
  createCoupon,
  getCoupons,
  applyCoupon,
  deleteCoupon,
} from "../../controller/admin/couponController.js";

const router = express.Router();

// Admin
router.post("/", createCoupon);
router.get("/", getCoupons);
router.delete("/:id", deleteCoupon);

// User
router.post("/apply", applyCoupon);

export default router;
