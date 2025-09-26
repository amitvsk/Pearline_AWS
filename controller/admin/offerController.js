import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import Offer from "../../model/admin/offerModel.js";

dotenv.config();

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload helper
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

// Delete helper
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split("/").pop();
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
  } catch (err) {
    console.error("Error deleting from S3:", err.message);
  }
};

// CRUD
export const uploadOffer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });
    const imageUrl = await uploadToS3(req.file);
    const doc = await Offer.create({ image: imageUrl });
    res.status(201).json({ message: "Offer uploaded", offer: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne().sort({ createdAt: -1 });
    res.status(200).json(offer || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Not found" });

    if (req.file) {
      await deleteFromS3(offer.image);
      offer.image = await uploadToS3(req.file);
    }
    await offer.save();
    res.status(200).json({ message: "Updated", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Not found" });

    await deleteFromS3(offer.image);
    await offer.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
