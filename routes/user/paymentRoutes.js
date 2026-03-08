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
// Support both GET and POST methods
router.get("/callback", paymentCallback);
router.post("/callback", paymentCallback);

// Test callback endpoint for debugging
router.get("/callback/test", (req, res) => {
  res.json({
    message: "Payment callback endpoint is working",
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
});

// Payment webhook (PhonePe sends payment status here)
// Support both GET and POST methods
router.get("/webhook", paymentWebhook);
router.post("/webhook", paymentWebhook);

// Check payment status
router.get("/status/:merchantTransactionId", checkPaymentStatusEndpoint);

// Get all transactions (Admin)
router.get("/admin/transactions", getAllTransactions);

// Get user transactions
router.get("/my-transactions", authMiddleware, getUserTransactions);

export default router;
