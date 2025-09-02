import testimonialModel from "../../model/admin/testimonialModel.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split("/").pop();
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
};

// Create
export const createTestimonial = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToS3(req.file);
    const testimonial = await testimonialModel.create({ name: req.body.name, quote: req.body.quote, image: imageUrl });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialModel.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get by id 
export const getTestimonialsById = async (req , res) =>{
    try{
        const testimonial = await testimonialModel.findById(req.params.id);
        if(!testimonial) return res.status(404).json({message: "Testimonial not found"});
        res.status(200).json(testimonial);
    }catch (error){
        res.status(500).json({message: error.message});
    }
}

// Update
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await testimonialModel.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    if (req.file) {
      if (testimonial.image) await deleteFromS3(testimonial.image);
      testimonial.image = await uploadToS3(req.file);
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

    if (testimonial.image) await deleteFromS3(testimonial.image);
    await testimonial.deleteOne();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
