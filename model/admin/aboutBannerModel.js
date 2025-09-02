import mongoose from "mongoose";

const aboutBannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("AboutBanner", aboutBannerSchema);
