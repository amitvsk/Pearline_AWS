import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    homePageDisplay: { type: Boolean, default: false },
    pearlineCollection: {
      type: String,
      enum: ["1", "2", "3", "4", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
