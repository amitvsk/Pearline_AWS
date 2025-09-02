import mongoose from "mongoose";

const arrivalBannerSchema = new mongoose.Schema({
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("ArrivalBanner", arrivalBannerSchema);
