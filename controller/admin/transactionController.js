import Transaction from "../../model/user/Transaction.js";
import Order from "../../model/user/Order.js";

// Get all transactions with filters
export const getAllTransactions = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate({
        path: "orderId",
        populate: { path: "products.product" }
      })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const successfulTransactions = await Transaction.countDocuments({ status: "SUCCESS" });
    const failedTransactions = await Transaction.countDocuments({ status: "FAILED" });
    const pendingTransactions = await Transaction.countDocuments({ status: "PENDING" });

    const totalRevenue = await Transaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await Transaction.aggregate([
      { 
        $match: { 
          status: "SUCCESS",
          createdAt: { $gte: todayStart }
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single transaction details
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate({
        path: "orderId",
        populate: { path: "products.product" }
      })
      .populate("user", "name email phone");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refund transaction (if needed in future)
export const refundTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "SUCCESS") {
      return res.status(400).json({ message: "Only successful transactions can be refunded" });
    }

    // TODO: Implement PhonePe refund API call here
    // For now, just update status
    transaction.status = "REFUNDED";
    await transaction.save();

    // Update order status
    const order = await Order.findById(transaction.orderId);
    if (order) {
      order.status = "Cancelled";
      order.paymentStatus = "Refunded";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Transaction refunded successfully",
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
