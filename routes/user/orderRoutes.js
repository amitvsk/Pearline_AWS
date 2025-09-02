import express from "express";
import { placeOrder, getMyOrders, getAllOrders,updateOrderStatus } from "../../controller/user/orderController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/place", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/admin/orders", getAllOrders);
router.put("/admin/orders/:id/status", updateOrderStatus);
export default router;
