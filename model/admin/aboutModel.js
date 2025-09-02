import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  badges: [{ type: String }],
}, { timestamps: true });

const About = mongoose.model("About", aboutSchema);
export default About;
