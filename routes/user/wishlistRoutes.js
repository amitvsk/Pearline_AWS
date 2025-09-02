import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist } from "../../controller/user/wishlistController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, addToWishlist);
router.post("/remove", authMiddleware, removeFromWishlist);
router.get("/", authMiddleware, getWishlist);

export default router;
