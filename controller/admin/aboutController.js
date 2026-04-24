import dotenv from "dotenv";
import About from "../../model/admin/aboutModel.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// ================= CRUD =================

// Create / Upload About Section
export const uploadAbout = async (req, res) => {
  try {
    const { title, description, badges } = req.body;
    const image = req.file ? await saveToLocal(req.file) : req.body.image;

    const newAbout = await About.create({
      title,
      description,
      badges: badges ? JSON.parse(badges) : [],
      image
    });

    res.status(201).json({ success: true, data: newAbout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all About sections
export const getAboutSections = async (req, res) => {
  try {
    const sections = await About.find().sort({ createdAt: -1 });
    const processedSections = sections.map(section => {
      const sectionObj = section.toObject();
      if (sectionObj.image) sectionObj.image = toFullUrl(sectionObj.image);
      return sectionObj;
    });
    res.status(200).json(processedSections);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get About section by ID
export const getAboutById = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });
    
    const sectionObj = section.toObject();
    if (sectionObj.image) sectionObj.image = toFullUrl(sectionObj.image);
    
    res.status(200).json(sectionObj);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update About section
export const updateAbout = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });

    if (req.file) {
      await deleteFromLocal(section.image);
      section.image = await saveToLocal(req.file);
    }

    section.title = req.body.title || section.title;
    section.description = req.body.description || section.description;
    section.badges = req.body.badges ? JSON.parse(req.body.badges) : section.badges;

    await section.save();
    res.status(200).json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete About section
export const deleteAbout = async (req, res) => {
  try {
    const section = await About.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Not found" });

    await deleteFromLocal(section.image);
    await section.deleteOne();

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
