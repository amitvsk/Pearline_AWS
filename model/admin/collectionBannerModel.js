import mongoose from "mongoose";

const collectionBannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    mobImage: { type: String, required: true }
  },
  { timestamps: true }
);

const collectionBannerModel = mongoose.model("CollectionBanner", collectionBannerSchema);

export default collectionBannerModel;
