import Order from "../../model/user/Order.js";
import Transaction from "../../model/user/Transaction.js";
import Cart from "../../model/user/Cart.js";
import productModel from "../../model/admin/productModel.js";
import phonePeClient from "../../config/phonepe.js";
import { CreateSdkOrderRequest } from 'pg-sdk-node';
import crypto from 'crypto';

// Create order and initiate payment
export const createOrderAndInitiatePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, deliveryMethod, shippingMethod } = req.body;

    // Get cart items
    const cartItems = await Cart.find({ user: userId }).populate("product");
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter out invalid cart items (where product is null)
    const validCartItems = cartItems.filter(item => item.product);
    
    if (validCartItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    // Check stock availability
    for (const item of validCartItems) {
      if (item.product.stock && item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.product}`,
        });
      }
    }

    // Calculate total
    const total = validCartItems.reduce(
      (sum, item) => {
        return sum + (item.product.price || 0) * item.quantity;
      },
      0
    );

    // Generate unique merchant transaction ID
    const merchantTransactionId = `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create order (status: Pending, paymentStatus: Pending)
    const order = new Order({
      user: userId,
      products: validCartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      shippingAddress,
      deliveryMethod,
      shippingMethod,
      paymentMethod: "PhonePe",
      total,
      status: "Pending",
      paymentStatus: "Pending",
      merchantTransactionId
    });

    await order.save();

    // Create transaction record
    const transaction = new Transaction({
      orderId: order._id,
      merchantTransactionId,
      amount: total,
      status: "PENDING",
      user: userId
    });

    await transaction.save();

    // Update order with transaction reference
    order.transactionId = transaction._id;
    await order.save();

    // Initiate PhonePe payment using official SDK
    const phoneNumber = shippingAddress.phone || "9999999999";
    
    // Check if mock mode is enabled
    const isMockMode = process.env.PHONEPE_MOCK_MODE === 'true';
    
    if (isMockMode) {
      // Mock payment for testing
      console.log('Mock Payment Mode - Skipping PhonePe API call');
      
      const mockPaymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/payment/mock?orderId=${order._id}&merchantTransactionId=${merchantTransactionId}`;
      
      res.status(200).json({
        success: true,
        message: "Payment initiated successfully (Mock Mode)",
        orderId: order._id,
        merchantTransactionId,
        paymentUrl: mockPaymentUrl,
        isMockMode: true
      });
      return;
    }
    
    // Real PhonePe payment using official SDK
    const redirectUrl = `${process.env.PHONEPE_REDIRECT_URL}?orderId=${order._id}`;
    
    const paymentRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantTransactionId)
      .amount(total * 100) // Convert to paise
      .redirectUrl(redirectUrl)
      .build();

    console.log('PhonePe Payment Request:', {
      merchantOrderId: merchantTransactionId,
      amount: total * 100,
      redirectUrl
    });

    const response = await phonePeClient.pay(paymentRequest);
    
    console.log('PhonePe Payment Response:', response);

    const checkoutUrl = response.redirectUrl;
    
    if (!checkoutUrl) {
      console.error("Invalid PhonePe response:", response);
      
      // Update order and transaction status to failed
      order.status = "Failed";
      order.paymentStatus = "Failed";
      await order.save();

      transaction.status = "FAILED";
      transaction.responseMessage = "PhonePe did not return a URL";
      await transaction.save();

      return res.status(500).json({ 
        success: false,
        error: "PhonePe did not return a URL" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      orderId: order._id,
      merchantTransactionId,
      paymentUrl: checkoutUrl,
      phonePeOrderId: response.orderId
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Payment callback handler
export const paymentCallback = async (req, res) => {
  try {
    // Support both query params (GET) and body (POST)
    const orderId = req.query.orderId || req.body.orderId;
    const merchantTransactionId = req.query.merchantTransactionId || req.body.merchantTransactionId;

    console.log("=== Payment Callback START ===");
    console.log("Payment Callback Received:", {
      method: req.method,
      orderId,
      merchantTransactionId,
      query: req.query,
      body: req.body
    });

    if (!orderId) {
      console.error("Order ID missing in callback");
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?error=missing_order_id`);
    }

    // First, try to find the order
    let order;
    try {
      order = await Order.findById(orderId);
      console.log("Order lookup result:", order ? "Found" : "Not found");
    } catch (dbError) {
      console.error("Database error finding order:", dbError);
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?error=database_error`);
    }

    if (!order) {
      console.error("Order not found:", orderId);
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?error=order_not_found`);
    }

    console.log("Order details:", {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      hasMerchantTransactionId: !!order.merchantTransactionId
    });

    // CRITICAL CHECK: If order is already completed by webhook, redirect to success immediately
    if (order.status === "Paid" && order.paymentStatus === "Completed") {
      console.log("✅ Order already completed by webhook - Redirecting to SUCCESS page");
      console.log("=== Payment Callback END (Already Completed) ===");
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/success?orderId=${orderId}`);
    }

    // Verify order has merchantTransactionId
    if (!order.merchantTransactionId) {
      console.error("Order missing merchantTransactionId:", {
        orderId: order._id
      });
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?error=invalid_order_data`);
    }

    // Check payment status using official SDK
    try {
      console.log("Checking payment status with PhonePe for:", order.merchantTransactionId);
      const statusResponse = await phonePeClient.getOrderStatus(order.merchantTransactionId);
      
      console.log("Payment Status Response:", statusResponse);

      if (statusResponse.state === "COMPLETED") {
        // Payment successful - complete the order
        console.log("✅ Payment successful via callback, completing order...");
        await completeOrder(order, statusResponse);
        console.log("=== Payment Callback END (Success) ===");
        
        // Redirect to success page
        return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/success?orderId=${orderId}`);
      } else if (statusResponse.state === "PENDING") {
        // Payment still pending
        console.log("⏳ Payment pending, redirecting to pending page...");
        console.log("=== Payment Callback END (Pending) ===");
        return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/pending?orderId=${orderId}`);
      } else {
        // Payment failed
        console.log("❌ Payment failed:", statusResponse);
        order.status = "Failed";
        order.paymentStatus = "Failed";
        await order.save();

        const transaction = await Transaction.findOne({ orderId: order._id });
        if (transaction) {
          transaction.status = statusResponse.state || "FAILED";
          transaction.responseMessage = statusResponse.message || "Payment failed";
          await transaction.save();
        }

        console.log("=== Payment Callback END (Failed) ===");
        // Redirect to failure page
        return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?orderId=${orderId}`);
      }
    } catch (statusError) {
      console.error("Error checking payment status:", {
        error: statusError.message,
        stack: statusError.stack,
        merchantTransactionId: order?.merchantTransactionId
      });
      
      // IMPORTANT: Check again if order was completed by webhook during the status check
      try {
        const freshOrder = await Order.findById(orderId);
        if (freshOrder && freshOrder.status === "Paid" && freshOrder.paymentStatus === "Completed") {
          console.log("✅ Order was completed by webhook during status check - Redirecting to SUCCESS");
          console.log("=== Payment Callback END (Completed by Webhook) ===");
          return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/success?orderId=${orderId}`);
        }
      } catch (recheckError) {
        console.error("Error rechecking order:", recheckError);
      }
      
      // Otherwise redirect to pending page
      console.log("⏳ Status check failed, redirecting to pending page");
      console.log("=== Payment Callback END (Status Check Failed) ===");
      return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/pending?orderId=${orderId}&error=status_check_failed`);
    }
  } catch (err) {
    console.error("❌ Payment callback error:", {
      error: err.message,
      stack: err.stack
    });
    
    // LAST RESORT: Try to check if order is completed before redirecting to failed
    try {
      const orderId = req.query.orderId || req.body.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.status === "Paid" && order.paymentStatus === "Completed") {
          console.log("✅ Order is completed despite error - Redirecting to SUCCESS");
          console.log("=== Payment Callback END (Error but Completed) ===");
          return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/success?orderId=${orderId}`);
        }
      }
    } catch (finalCheckError) {
      console.error("Final order check failed:", finalCheckError);
    }
    
    const errorMessage = err.message || 'callback_error';
    console.log("=== Payment Callback END (Error) ===");
    return res.redirect(`${process.env.FRONTEND_URL || 'https://pearline.in'}/payment/failed?error=${encodeURIComponent(errorMessage)}`);
  }
};

// PhonePe Webhook handler
export const paymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    console.log("Webhook received:", JSON.stringify(webhookData, null, 2));

    // Handle different webhook formats from PhonePe SDK
    let merchantTransactionId, transactionId, state, responseCode;
    
    // Format 1: Direct webhook data
    if (webhookData.merchantTransactionId) {
      merchantTransactionId = webhookData.merchantTransactionId;
      transactionId = webhookData.transactionId;
      state = webhookData.state;
      responseCode = webhookData.responseCode;
    }
    // Format 2: SDK webhook with payload
    else if (webhookData.payload) {
      merchantTransactionId = webhookData.payload.merchantOrderId;
      transactionId = webhookData.payload.orderId;
      state = webhookData.payload.state;
      responseCode = webhookData.event;
    }
    // Format 3: Nested data structure
    else if (webhookData.data) {
      merchantTransactionId = webhookData.data.merchantTransactionId || webhookData.data.merchantOrderId;
      transactionId = webhookData.data.transactionId || webhookData.data.orderId;
      state = webhookData.data.state;
      responseCode = webhookData.data.responseCode || webhookData.code;
    }

    console.log("Extracted webhook data:", {
      merchantTransactionId,
      transactionId,
      state,
      responseCode
    });

    if (!merchantTransactionId) {
      console.error("Merchant transaction ID missing in webhook");
      return res.status(400).json({ success: false, message: "Invalid webhook data - missing merchantTransactionId" });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ merchantTransactionId });
    if (!transaction) {
      console.error("Transaction not found:", merchantTransactionId);
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    console.log("Transaction found:", {
      transactionId: transaction._id,
      orderId: transaction.orderId,
      currentStatus: transaction.status
    });

    // Update transaction
    transaction.phonePeTransactionId = transactionId;
    transaction.responseCode = responseCode;
    transaction.webhookData = webhookData;

    // Find order
    const order = await Order.findById(transaction.orderId);
    if (!order) {
      console.error("Order not found:", transaction.orderId);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("Order found:", {
      orderId: order._id,
      currentStatus: order.status,
      paymentStatus: order.paymentStatus
    });

    if (state === "COMPLETED") {
      // Payment successful
      console.log("Webhook: Payment completed, processing order...");
      
      transaction.status = "SUCCESS";
      transaction.responseMessage = "Payment completed";
      await transaction.save();

      // Complete the order (only if not already completed)
      if (order.status !== "Paid") {
        await completeOrder(order, webhookData.payload || webhookData.data || webhookData);
        console.log("Order completed successfully via webhook");
      } else {
        console.log("Order already completed, skipping");
      }

      return res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      // Payment failed
      console.log("Webhook: Payment failed or pending:", state);
      
      transaction.status = state === "PENDING" ? "PENDING" : "FAILED";
      transaction.responseMessage = webhookData.message || `Payment ${state}`;
      await transaction.save();

      if (state === "FAILED") {
        order.status = "Failed";
        order.paymentStatus = "Failed";
        await order.save();
      }

      return res.status(200).json({ success: true, message: `Payment ${state}` });
    }
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to complete order after successful payment
async function completeOrder(order, paymentData) {
  // Update order status
  order.status = "Paid";
  order.paymentStatus = "Completed";
  await order.save();

  // Update transaction
  const transaction = await Transaction.findOne({ orderId: order._id });
  if (transaction) {
    transaction.status = "SUCCESS";
    transaction.phonePeTransactionId = paymentData.transactionId || paymentData.phonePeTransactionId;
    transaction.responseCode = paymentData.responseCode || paymentData.code;
    transaction.responseMessage = paymentData.message || "Payment completed";
    await transaction.save();
  }

  // Reduce stock for each product
  const populatedOrder = await Order.findById(order._id).populate("products.product");
  for (const item of populatedOrder.products) {
    await productModel.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear user's cart
  await Cart.deleteMany({ user: order.user });

  return order;
}

// Check payment status endpoint
export const checkPaymentStatusEndpoint = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;

    // Use official SDK to check status
    const statusResponse = await phonePeClient.getOrderStatus(merchantTransactionId);

    res.status(200).json({
      success: true,
      data: statusResponse,
      isSuccessful: statusResponse.state === "COMPLETED",
      isPending: statusResponse.state === "PENDING",
      isFailed: statusResponse.state === "FAILED"
    });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all transactions (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("orderId")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
