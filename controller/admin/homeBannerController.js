


import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import homeBannerModel from "../../model/admin/homeBannerModel.js";
import { saveToLocal, deleteFromLocal } from "../../utils/localStorage.js";

dotenv.config();

// ================= CRUD Controllers =================

export const uploadBanners = async (req, res) => {
  try {
    if (!req.files || 
        !req.files.banner1 || !req.files.banner2 || !req.files.banner3 ||
        !req.files.mob_banner1 || !req.files.mob_banner2 || !req.files.mob_banner3) {
      return res.status(400).json({ 
        message: "All six banner images are required (3 desktop + 3 mobile)" 
      });
    }

    // Upload desktop banners to local storage
    const banner1Url = await saveToLocal(req.files.banner1[0]);
    const banner2Url = await saveToLocal(req.files.banner2[0]);
    const banner3Url = await saveToLocal(req.files.banner3[0]);

    // Upload mobile banners to local storage
    const mobBanner1Url = await saveToLocal(req.files.mob_banner1[0]);
    const mobBanner2Url = await saveToLocal(req.files.mob_banner2[0]);
    const mobBanner3Url = await saveToLocal(req.files.mob_banner3[0]);

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
    const banner = banners[0];
    
    if (banner) {
      const bannerObj = banner.toObject();
      // Convert relative URLs to full URLs
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      
      if (bannerObj.banner1_image && !bannerObj.banner1_image.startsWith('http')) {
        bannerObj.banner1_image = `${baseUrl}${bannerObj.banner1_image}`;
      }
      if (bannerObj.banner2_image && !bannerObj.banner2_image.startsWith('http')) {
        bannerObj.banner2_image = `${baseUrl}${bannerObj.banner2_image}`;
      }
      if (bannerObj.banner3_image && !bannerObj.banner3_image.startsWith('http')) {
        bannerObj.banner3_image = `${baseUrl}${bannerObj.banner3_image}`;
      }
      if (bannerObj.mob_banner1_image && !bannerObj.mob_banner1_image.startsWith('http')) {
        bannerObj.mob_banner1_image = `${baseUrl}${bannerObj.mob_banner1_image}`;
      }
      if (bannerObj.mob_banner2_image && !bannerObj.mob_banner2_image.startsWith('http')) {
        bannerObj.mob_banner2_image = `${baseUrl}${bannerObj.mob_banner2_image}`;
      }
      if (bannerObj.mob_banner3_image && !bannerObj.mob_banner3_image.startsWith('http')) {
        bannerObj.mob_banner3_image = `${baseUrl}${bannerObj.mob_banner3_image}`;
      }
      
      res.status(200).json(bannerObj);
    } else {
      res.status(200).json({});
    }
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
      await deleteFromLocal(banner.banner1_image);
      banner.banner1_image = await saveToLocal(req.files.banner1[0]);
    }
    if (req.files?.banner2) {
      await deleteFromLocal(banner.banner2_image);
      banner.banner2_image = await saveToLocal(req.files.banner2[0]);
    }
    if (req.files?.banner3) {
      await deleteFromLocal(banner.banner3_image);
      banner.banner3_image = await saveToLocal(req.files.banner3[0]);
    }

    // Update mobile banners if new ones are uploaded
    if (req.files?.mob_banner1) {
      await deleteFromLocal(banner.mob_banner1_image);
      banner.mob_banner1_image = await saveToLocal(req.files.mob_banner1[0]);
    }
    if (req.files?.mob_banner2) {
      await deleteFromLocal(banner.mob_banner2_image);
      banner.mob_banner2_image = await saveToLocal(req.files.mob_banner2[0]);
    }
    if (req.files?.mob_banner3) {
      await deleteFromLocal(banner.mob_banner3_image);
      banner.mob_banner3_image = await saveToLocal(req.files.mob_banner3[0]);
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

    // Delete desktop images from local storage
    await deleteFromLocal(banner.banner1_image);
    await deleteFromLocal(banner.banner2_image);
    await deleteFromLocal(banner.banner3_image);

    // Delete mobile images from local storage
    await deleteFromLocal(banner.mob_banner1_image);
    await deleteFromLocal(banner.mob_banner2_image);
    await deleteFromLocal(banner.mob_banner3_image);

    await banner.deleteOne();

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
