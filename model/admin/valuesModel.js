import mongoose from "mongoose";

const valuesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Values = mongoose.model("Values", valuesSchema);

export default Values;
