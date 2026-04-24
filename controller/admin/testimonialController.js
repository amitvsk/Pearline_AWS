import testimonialModel from "../../model/admin/testimonialModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// Create
export const createTestimonial = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await saveToLocal(req.file);
    const testimonial = await testimonialModel.create({ 
      name: req.body.name, 
      quote: req.body.quote, 
      image: imageUrl 
    });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialModel.find().sort({ createdAt: -1 });
    
    // Convert to full URLs
    const processedTestimonials = testimonials.map(t => {
      const tObj = t.toObject();
      if (tObj.image) tObj.image = toFullUrl(tObj.image);
      return tObj;
    });
    
    res.status(200).json(processedTestimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get by id 
export const getTestimonialsById = async (req, res) => {
  try {
    const testimonial = await testimonialModel.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    
    const tObj = testimonial.toObject();
    if (tObj.image) tObj.image = toFullUrl(tObj.image);
    
    res.status(200).json(tObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await testimonialModel.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    if (req.file) {
      if (testimonial.image) await deleteFromLocal(testimonial.image);
      testimonial.image = await saveToLocal(req.file);
    }
    testimonial.name = req.body.name;
    testimonial.quote = req.body.quote;

    await testimonial.save();
    res.status(200).json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await testimonialModel.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    if (testimonial.image) await deleteFromLocal(testimonial.image);
    await testimonial.deleteOne();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
