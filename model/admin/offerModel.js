import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
