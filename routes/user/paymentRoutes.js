import express from "express";
import {
  createOrderAndInitiatePayment,
  paymentCallback,
  paymentWebhook,
  checkPaymentStatusEndpoint,
  getAllTransactions,
  getUserTransactions
} from "../../controller/user/paymentController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// Create order and initiate payment (requires authentication)
router.post("/initiate", authMiddleware, createOrderAndInitiatePayment);

// Payment callback (PhonePe redirects here after payment)
router.post("/callback", paymentCallback);

// Payment webhook (PhonePe sends payment status here)
router.post("/webhook", paymentWebhook);

// Check payment status
router.get("/status/:merchantTransactionId", checkPaymentStatusEndpoint);

// Get all transactions (Admin)
router.get("/admin/transactions", getAllTransactions);

// Get user transactions
router.get("/my-transactions", authMiddleware, getUserTransactions);

export default router;
