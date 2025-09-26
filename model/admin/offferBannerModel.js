import mongoose from "mongoose";

const offerBannerSchema = new mongoose.Schema({
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("OfferBanner", offerBannerSchema);
