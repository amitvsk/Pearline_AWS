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
    const { orderId } = req.query;

    console.log("Payment Callback - Order ID:", orderId);

    if (!orderId) {
      return res.status(400).send("Order ID missing");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Check payment status using official SDK
    const statusResponse = await phonePeClient.getOrderStatus(order.merchantTransactionId);
    
    console.log("Payment Status Response:", statusResponse);

    if (statusResponse.state === "COMPLETED") {
      // Payment successful - complete the order
      await completeOrder(order, statusResponse);
      
      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
    } else {
      // Payment failed or pending
      order.status = "Failed";
      order.paymentStatus = "Failed";
      await order.save();

      const transaction = await Transaction.findOne({ orderId: order._id });
      if (transaction) {
        transaction.status = statusResponse.state || "FAILED";
        transaction.responseMessage = statusResponse.message || "Payment failed";
        await transaction.save();
      }

      // Redirect to failure page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}`);
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    res.status(500).send("Payment verification failed");
  }
};

// PhonePe Webhook handler
export const paymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    console.log("Webhook received:", webhookData);

    // The official SDK handles webhook verification internally
    // Extract transaction details from webhook
    const { merchantTransactionId, transactionId, state, responseCode } = webhookData;

    if (!merchantTransactionId) {
      console.error("Merchant transaction ID missing in webhook");
      return res.status(400).json({ success: false, message: "Invalid webhook data" });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ merchantTransactionId });
    if (!transaction) {
      console.error("Transaction not found:", merchantTransactionId);
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

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

    if (state === "COMPLETED") {
      // Payment successful
      transaction.status = "SUCCESS";
      transaction.responseMessage = "Payment completed";
      await transaction.save();

      // Complete the order
      await completeOrder(order, webhookData);

      return res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      // Payment failed
      transaction.status = "FAILED";
      transaction.responseMessage = webhookData.message || "Payment failed";
      await transaction.save();

      order.status = "Failed";
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(200).json({ success: true, message: "Payment failed" });
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
