import Order from "../../model/user/Order.js";
import Cart from "../../model/user/Cart.js";

// export const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { shippingAddress, deliveryMethod, shippingMethod, paymentMethod } = req.body;

//     // Get cart items
//     const cartItems = await Cart.find({ user: userId }).populate("product");
//     if (!cartItems.length) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Calculate total
//     const total = cartItems.reduce(
//       (sum, item) => sum + item.product.price * item.quantity,
//       0
//     );

//     // Create order
//     const order = new Order({
//       user: userId,
//       products: cartItems.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//       })),
//       shippingAddress,
//       deliveryMethod,
//       shippingMethod,
//       paymentMethod,
//       total,
//     });

//     await order.save();

//     // Clear cart after placing order
//     await Cart.deleteMany({ user: userId });

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


import productModel from "../../model/admin/productModel.js"; // make sure this is imported

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, deliveryMethod, shippingMethod, paymentMethod } = req.body;

    // get cart items
    const cartItems = await Cart.find({ user: userId }).populate("product");
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // check stock availability before order
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.product}`,
        });
      }
    }

    // calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // create order
    const order = new Order({
      user: userId,
      products: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      shippingAddress,
      deliveryMethod,
      shippingMethod,
      paymentMethod,
      total,
    });

    await order.save();

    // ✅ reduce stock for each product
    for (const item of cartItems) {
      await productModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // clear cart after placing order
    await Cart.deleteMany({ user: userId });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// In orderController.js
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product") // ✅ Populate product details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get user orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

