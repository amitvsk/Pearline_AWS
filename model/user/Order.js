import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    deliveryMethod: { type: String, enum: ["ship", "pickup"], default: "ship" },
    shippingMethod: { type: String, enum: ["standard", "express"], default: "standard" },
    paymentMethod: { type: String },
    total: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Shipped", "Delivered","Failed"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
