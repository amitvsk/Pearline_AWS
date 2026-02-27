import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    merchantTransactionId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    phonePeTransactionId: { 
      type: String 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"], 
      default: "PENDING" 
    },
    paymentMethod: { 
      type: String 
    },
    responseCode: { 
      type: String 
    },
    responseMessage: { 
      type: String 
    },
    webhookData: { 
      type: Object 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
