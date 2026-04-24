import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import Offer from "../../model/admin/offerModel.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// CRUD
export const uploadOffer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });
    const imageUrl = await saveToLocal(req.file);
    const doc = await Offer.create({ image: imageUrl });
    res.status(201).json({ message: "Offer uploaded", offer: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne().sort({ createdAt: -1 });
    if (offer && offer.image) {
      const offerObj = offer.toObject();
      offerObj.image = toFullUrl(offerObj.image);
      return res.status(200).json(offerObj);
    }
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
      await deleteFromLocal(offer.image);
      offer.image = await saveToLocal(req.file);
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

    await deleteFromLocal(offer.image);
    await offer.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
