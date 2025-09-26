import mongoose from "mongoose";

const shippingSalesSchema = new mongoose.Schema({
  shippingText: {
    type: String,
    required: true,
  },
  salesText: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("ShippingSales", shippingSalesSchema);
