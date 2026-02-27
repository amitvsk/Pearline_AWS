import express from "express";
import {
  getAllTransactions,
  getTransactionStats,
  getTransactionById,
  refundTransaction
} from "../../controller/admin/transactionController.js";

const router = express.Router();

// Get all transactions with filters
router.get("/", getAllTransactions);

// Get transaction statistics
router.get("/stats", getTransactionStats);

// Get single transaction
router.get("/:id", getTransactionById);

// Refund transaction
router.post("/:id/refund", refundTransaction);

export default router;
