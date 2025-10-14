import mongoose from "mongoose";

const homebanner2Schema = new mongoose.Schema(
  {
    image: { type: String, required: true }
  },
  { timestamps: true }
);

const homebanner2Model = mongoose.model("HomeBanner2", homebanner2Schema);

export default homebanner2Model;
