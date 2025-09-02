

import express from "express";
import { addToCart, removeFromCart, updateCartQuantity, getCart } from "../../controller/user/cartController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.delete("/remove/:productId", authMiddleware, removeFromCart);  // ✅ matches frontend
router.put("/update/:productId", authMiddleware, updateCartQuantity); // ✅ matches frontend

export default router;

