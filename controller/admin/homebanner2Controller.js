import dotenv from "dotenv";
import offferBannerModel from "../../model/admin/homebanner2Model.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// CRUD
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });
    const imageUrl = await saveToLocal(req.file);
    const doc = await offferBannerModel.create({ image: imageUrl });
    res.status(201).json({ message: "Banner uploaded", banner: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBanner = async (req, res) => {
  try {
    const banner = await offferBannerModel.findOne().sort({ createdAt: -1 });
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

export const updateBanner = async (req, res) => {
  try {
    const banner = await offferBannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    if (req.file) {
      await deleteFromLocal(banner.image);
      banner.image = await saveToLocal(req.file);
    }
    await banner.save();
    res.status(200).json({ message: "Updated", banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await offferBannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    await deleteFromLocal(banner.image);
    await banner.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
