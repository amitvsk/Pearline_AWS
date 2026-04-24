import dotenv from "dotenv";
import AboutBanner from "../../model/admin/aboutBannerModel.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// ✅ CREATE
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const imageUrl = await saveToLocal(req.file);
    const doc = await AboutBanner.create({ image: imageUrl, title, description });

    res.status(201).json({ message: "Banner uploaded", banner: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ READ
export const getBanner = async (req, res) => {
  try {
    const banner = await AboutBanner.findOne().sort({ createdAt: -1 });
    if (banner) {
      const bannerObj = banner.toObject();
      if (bannerObj.image) bannerObj.image = toFullUrl(bannerObj.image);
      return res.status(200).json(bannerObj);
    }
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE
export const updateBanner = async (req, res) => {
  try {
    const banner = await AboutBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    const { title, description } = req.body;

    if (req.file) {
      await deleteFromLocal(banner.image);
      banner.image = await saveToLocal(req.file);
    }
    if (title) banner.title = title;
    if (description) banner.description = description;

    await banner.save();
    res.status(200).json({ message: "Updated", banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE
export const deleteBanner = async (req, res) => {
  try {
    const banner = await AboutBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    await deleteFromLocal(banner.image);
    await banner.deleteOne();

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
