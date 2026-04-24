import dotenv from "dotenv";
import ArrivalBanner from "../../model/admin/arrivalBannerModel.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// CRUD
export const getBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findOne().sort({ createdAt: -1 });
    if (banner) {
      const bannerObj = banner.toObject();
      if (bannerObj.image) bannerObj.image = toFullUrl(bannerObj.image);
      if (bannerObj.mobImage) bannerObj.mobImage = toFullUrl(bannerObj.mobImage);
      return res.status(200).json(bannerObj);
    }
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Update desktop image if provided
    if (req.files && req.files.image) {
      await deleteFromLocal(banner.image);
      banner.image = await saveToLocal(req.files.image[0]);
    }

    // Update mobile image if provided
    if (req.files && req.files.mobImage) {
      await deleteFromLocal(banner.mobImage);
      banner.mobImage = await saveToLocal(req.files.mobImage[0]);
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

export const uploadBanner = async (req, res) => {
  try {
    if (!req.files || !req.files.image || !req.files.mobImage) {
      return res.status(400).json({ 
        message: "Both desktop image and mobile image are required" 
      });
    }

    const imageUrl = await saveToLocal(req.files.image[0]);
    const mobImageUrl = await saveToLocal(req.files.mobImage[0]);

    const banner = await ArrivalBanner.create({ 
      image: imageUrl, 
      mobImage: mobImageUrl 
    });

    res.status(201).json({ 
      message: "Banner uploaded successfully", 
      banner 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await ArrivalBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    await deleteFromLocal(banner.image);
    await deleteFromLocal(banner.mobImage);
    await banner.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
