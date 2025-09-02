import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import About from "../../model/admin/aboutModel.js";

dotenv.config();

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload file to S3
const uploadToS3 = async (file) => {
  const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split("/").pop();
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }));
  } catch (err) {
    console.error("Error deleting from S3:", err.message);
  }
};

// ================= CRUD =================

// Create / Upload About Section
export const uploadAbout = async (req, res) => {
  try {
    const { title, description, badges } = req.body;
    const image = req.file ? await uploadToS3(req.file) : req.body.image;

    const newAbout = await About.create({
      title,
      description,
      badges: badges ? JSON.parse(badges) : [],
      image
    });

    res.status(201).json({ success: true, data: newAbout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all About sections
export const getAboutSections = async (req, res) => {
  try {
    const sections = await About.find().sort({ createdAt: -1 });
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get About section by ID
export const getAboutById = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json(section);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update About section
export const updateAbout = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });

    if (req.file) {
      await deleteFromS3(section.image);
      section.image = await uploadToS3(req.file);
    }

    section.title = req.body.title || section.title;
    section.description = req.body.description || section.description;
    section.badges = req.body.badges ? JSON.parse(req.body.badges) : section.badges;

    await section.save();
    res.status(200).json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete About section
export const deleteAbout = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });

    await deleteFromS3(section.image);
    await section.deleteOne();

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
