import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import ArrivalBanner from "../../model/admin/arrivalBannerModel.js";

dotenv.config();

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Helper upload
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

// Helper delete
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split("/").pop();
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
  } catch (err) {
    console.error("Error deleting from S3:", err.message);
  }
};

// CRUD
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });
    const imageUrl = await uploadToS3(req.file);
    const doc = await ArrivalBanner.create({ image: imageUrl });
    res.status(201).json({ message: "Banner uploaded", banner: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findOne().sort({ createdAt: -1 });
    res.status(200).json(banner || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    if (req.file) {
      await deleteFromS3(banner.image);
      banner.image = await uploadToS3(req.file);
    }
    await banner.save();
    res.status(200).json({ message: "Updated", banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    await deleteFromS3(banner.image);
    await banner.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
