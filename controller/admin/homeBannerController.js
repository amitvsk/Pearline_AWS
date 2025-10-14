


import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import homeBannerModel from "../../model/admin/homeBannerModel.js";

dotenv.config();

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Helper: upload file to S3
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

// Helper: delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split("/").pop(); // get fileKey from URL
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }));
  } catch (err) {
    console.error("Error deleting from S3:", err.message);
  }
};

// ================= CRUD Controllers =================

// Upload banners
// export const uploadBanners = async (req, res) => {
//   try {
//     if (!req.files || !req.files.banner1 || !req.files.banner2 || !req.files.banner3) {
//       return res.status(400).json({ message: "All three banner images are required" });
//     }

//     const banner1Url = await uploadToS3(req.files.banner1[0]);
//     const banner2Url = await uploadToS3(req.files.banner2[0]);
//     const banner3Url = await uploadToS3(req.files.banner3[0]);

//     const bannerDoc = await homeBannerModel.create({
//       banner1_image: banner1Url,
//       banner2_image: banner2Url,
//       banner3_image: banner3Url
//     });

//     res.status(201).json({ message: "Banners uploaded successfully", banner: bannerDoc });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get latest banner
// export const getBanners = async (req, res) => {
//   try {
//     const banners = await homeBannerModel.find().sort({ createdAt: -1 }).limit(1);
//     res.status(200).json(banners[0] || {});
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get banner by ID
// export const getBannerById = async (req, res) => {
//   try {
//     const banner = await homeBannerModel.findById(req.params.id);
//     if (!banner) return res.status(404).json({ message: "Banner not found" });
//     res.status(200).json(banner);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update banner by ID
// export const updateBanner = async (req, res) => {
//   try {
//     const banner = await homeBannerModel.findById(req.params.id);
//     if (!banner) return res.status(404).json({ message: "Banner not found" });

//     // Replace images if new ones are uploaded
//     if (req.files?.banner1) {
//       await deleteFromS3(banner.banner1_image);
//       banner.banner1_image = await uploadToS3(req.files.banner1[0]);
//     }
//     if (req.files?.banner2) {
//       await deleteFromS3(banner.banner2_image);
//       banner.banner2_image = await uploadToS3(req.files.banner2[0]);
//     }
//     if (req.files?.banner3) {
//       await deleteFromS3(banner.banner3_image);
//       banner.banner3_image = await uploadToS3(req.files.banner3[0]);
//     }

//     await banner.save();
//     res.status(200).json({ message: "Banner updated successfully", banner });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete banner by ID
// export const deleteBanner = async (req, res) => {
//   try {
//     const banner = await homeBannerModel.findById(req.params.id);
//     if (!banner) return res.status(404).json({ message: "Banner not found" });

//     // Delete images from S3
//     await deleteFromS3(banner.banner1_image);
//     await deleteFromS3(banner.banner2_image);
//     await deleteFromS3(banner.banner3_image);

//     await banner.deleteOne();

//     res.status(200).json({ message: "Banner deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };













export const uploadBanners = async (req, res) => {
  try {
    if (!req.files || 
        !req.files.banner1 || !req.files.banner2 || !req.files.banner3 ||
        !req.files.mob_banner1 || !req.files.mob_banner2 || !req.files.mob_banner3) {
      return res.status(400).json({ 
        message: "All six banner images are required (3 desktop + 3 mobile)" 
      });
    }

    // Upload desktop banners
    const banner1Url = await uploadToS3(req.files.banner1[0]);
    const banner2Url = await uploadToS3(req.files.banner2[0]);
    const banner3Url = await uploadToS3(req.files.banner3[0]);

    // Upload mobile banners
    const mobBanner1Url = await uploadToS3(req.files.mob_banner1[0]);
    const mobBanner2Url = await uploadToS3(req.files.mob_banner2[0]);
    const mobBanner3Url = await uploadToS3(req.files.mob_banner3[0]);

    const bannerDoc = await homeBannerModel.create({
      banner1_image: banner1Url,
      banner2_image: banner2Url,
      banner3_image: banner3Url,
      mob_banner1_image: mobBanner1Url,
      mob_banner2_image: mobBanner2Url,
      mob_banner3_image: mobBanner3Url
    });

    res.status(201).json({ 
      message: "All banners uploaded successfully", 
      banner: bannerDoc 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest banners
export const getBanners = async (req, res) => {
  try {
    const banners = await homeBannerModel.find().sort({ createdAt: -1 }).limit(1);
    res.status(200).json(banners[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await homeBannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update banner by ID
export const updateBanner = async (req, res) => {
  try {
    const banner = await homeBannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Update desktop banners if new ones are uploaded
    if (req.files?.banner1) {
      await deleteFromS3(banner.banner1_image);
      banner.banner1_image = await uploadToS3(req.files.banner1[0]);
    }
    if (req.files?.banner2) {
      await deleteFromS3(banner.banner2_image);
      banner.banner2_image = await uploadToS3(req.files.banner2[0]);
    }
    if (req.files?.banner3) {
      await deleteFromS3(banner.banner3_image);
      banner.banner3_image = await uploadToS3(req.files.banner3[0]);
    }

    // Update mobile banners if new ones are uploaded
    if (req.files?.mob_banner1) {
      await deleteFromS3(banner.mob_banner1_image);
      banner.mob_banner1_image = await uploadToS3(req.files.mob_banner1[0]);
    }
    if (req.files?.mob_banner2) {
      await deleteFromS3(banner.mob_banner2_image);
      banner.mob_banner2_image = await uploadToS3(req.files.mob_banner2[0]);
    }
    if (req.files?.mob_banner3) {
      await deleteFromS3(banner.mob_banner3_image);
      banner.mob_banner3_image = await uploadToS3(req.files.mob_banner3[0]);
    }

    await banner.save();
    res.status(200).json({ 
      message: "Banner updated successfully", 
      banner 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete banner by ID
export const deleteBanner = async (req, res) => {
  try {
    const banner = await homeBannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete desktop images from S3
    await deleteFromS3(banner.banner1_image);
    await deleteFromS3(banner.banner2_image);
    await deleteFromS3(banner.banner3_image);

    // Delete mobile images from S3
    await deleteFromS3(banner.mob_banner1_image);
    await deleteFromS3(banner.mob_banner2_image);
    await deleteFromS3(banner.mob_banner3_image);

    await banner.deleteOne();

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
