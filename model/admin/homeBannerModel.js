import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  banner1_image: {
    type: String,
    required: true
  },
  banner2_image: {
    type: String,
    required: true
  },
  banner3_image: {
    type: String,
    required: true
  },
    mob_banner1_image: {
    type: String,
    required: true
  },
  mob_banner2_image: {
    type: String,
    required: true
  },
  mob_banner3_image: {
    type: String,
    required: true
  }

}, { timestamps: true });

const homeBannerModel = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

export default homeBannerModel;
