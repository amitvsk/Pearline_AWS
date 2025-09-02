import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import articleModel from "../../model/admin/articleModel.js";

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

// ================= CRUD Controllers =================

// Create article
// Create article
export const createArticle = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageUrl = await uploadToS3(req.file);

    const article = await articleModel.create({
      image: imageUrl,
      badge: req.body.badge,
      title: req.body.title,
      description: req.body.description,   // ✅ Added here
      category: req.body.category,
      date: req.body.date,
      readTime: req.body.readTime
    });

    res.status(201).json({ message: "Article created successfully", article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all articles
export const getArticles = async (req, res) => {
  try {
    const articles = await articleModel.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get article by ID
export const getArticleById = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (req.file) {
      await deleteFromS3(article.image);
      article.image = await uploadToS3(req.file);
    }

    article.badge = req.body.badge || article.badge;
    article.title = req.body.title || article.title;
    article.description = req.body.description || article.description;  // ✅ Added here
    article.category = req.body.category || article.category;
    article.date = req.body.date || article.date;
    article.readTime = req.body.readTime || article.readTime;

    await article.save();
    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    await deleteFromS3(article.image);
    await article.deleteOne();

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
