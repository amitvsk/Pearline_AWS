import mongoose from "mongoose";

const homeArrivalBannerSchema = new mongoose.Schema({
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("homeArrivalBanner", homeArrivalBannerSchema);
