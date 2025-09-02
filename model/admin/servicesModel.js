import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true, // optional if you want it always
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", servicesSchema);
