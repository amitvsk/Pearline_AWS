import mongoose from "mongoose";

const shopallBannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  mobImage: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("ShopallBanner", shopallBannerSchema);
