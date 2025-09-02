import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {   // ✅ Added field
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  readTime: {
    type: String,
    required: true
  }
}, { timestamps: true });

const articleModel = mongoose.models.Article || mongoose.model("Article", articleSchema);

export default articleModel;
