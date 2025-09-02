// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     image: { type: String, required: true },
//     product: { type: String, required: true },
//     category: { type: String, required: true },
//     collection: { type: String },
//     type: { type: String },
//     metal: { type: String }, // ✅ new field
//     price: { type: Number, required: true },
//     discount: { type: Number, default: 0 },
//     stock: { type: Number, default: 0 },
//     rating: { type: Number, default: 0 },
//     status: { 
//       type: String, 
//       enum: ["Available", "Out of stock"], 
//       default: "Available" 
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Product", productSchema);
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
    helpful: {
      yes: { type: Number, default: 0 },
      no: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },   // ✅ main image
    images: [{ type: String }],                // ✅ carousel images

    product: { type: String, required: true },
    category: { type: String, required: true },
    collection: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Collection",
  default: null,
},
    type: { type: String },
    metal: { type: String },

    price: { type: Number, required: true },
    usdPrice: { type: Number },                // ✅ USD price

    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Available", "Out of stock"],
      default: "Available",
    },

    description: { type: String },
    details: { type: String },
    careInstructions: { type: String },
    shippingAndReturn: { type: String },

    reviews: [reviewSchema],                   // ✅ embedded reviews
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
