import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import homeBannerModel from "../../model/admin/homeBannerModel";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload banner images
export const uploadBanners = async (req, res) => {
  try {
    if (!req.files || !req.files.banner1 || !req.files.banner2 || !req.files.banner3) {
      return res.status(400).json({ message: "All three banner images are required" });
    }

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

    const banner1Url = await uploadToS3(req.files.banner1[0]);
    const banner2Url = await uploadToS3(req.files.banner2[0]);
    const banner3Url = await uploadToS3(req.files.banner3[0]);

    const bannerDoc = await homeBannerModel.create({
      banner1_image: banner1Url,
      banner2_image: banner2Url,
      banner3_image: banner3Url
    });

    res.status(201).json({ message: "Banners uploaded successfully", banner: bannerDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
