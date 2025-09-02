import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String }, // S3 URL
    quote: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("testimonial", testimonialSchema);
