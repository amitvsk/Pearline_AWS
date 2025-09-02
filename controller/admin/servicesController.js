import Service from "../../model/admin/servicesModel.js";

// ➝ Create Service
export const createService = async (req, res) => {
  try {
    const { title, details, icon } = req.body;

    if (!title || !details || !icon) {
      return res.status(400).json({ message: "Title, details, and icon are required" });
    }

    const newService = new Service({ title, details, icon });
    await newService.save();

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➝ Get All Services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➝ Get Single Service
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➝ Update Service
export const updateService = async (req, res) => {
  try {
    const { title, details, icon } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { title, details, icon },
      { new: true }
    );

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➝ Delete Service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
