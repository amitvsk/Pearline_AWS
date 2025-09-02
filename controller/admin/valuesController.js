import Values from "../../model/admin/valuesModel.js";

// Create Value
export const createValue = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newValue = new Values({ title, description });
    await newValue.save();

    res.status(201).json(newValue);
  } catch (error) {
    res.status(500).json({ message: "Error creating value", error: error.message });
  }
};

// Get all Values
export const getValues = async (req, res) => {
  try {
    const values = await Values.find();
    res.status(200).json(values);
  } catch (error) {
    res.status(500).json({ message: "Error fetching values", error: error.message });
  }
};

// Get single Value by ID
export const getValueById = async (req, res) => {
  try {
    const value = await Values.findById(req.params.id);
    if (!value) return res.status(404).json({ message: "Value not found" });

    res.status(200).json(value);
  } catch (error) {
    res.status(500).json({ message: "Error fetching value", error: error.message });
  }
};

// Update Value
export const updateValue = async (req, res) => {
  try {
    const { title, description } = req.body;

    const updatedValue = await Values.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    if (!updatedValue) return res.status(404).json({ message: "Value not found" });

    res.status(200).json(updatedValue);
  } catch (error) {
    res.status(500).json({ message: "Error updating value", error: error.message });
  }
};

// Delete Value
export const deleteValue = async (req, res) => {
  try {
    const deletedValue = await Values.findByIdAndDelete(req.params.id);

    if (!deletedValue) return res.status(404).json({ message: "Value not found" });

    res.status(200).json({ message: "Value deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting value", error: error.message });
  }
};
