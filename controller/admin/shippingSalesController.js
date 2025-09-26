import ShippingSales from "../../model/admin/ShippingSales.js";

// Add Shipping & Sales Text
export const addShippingSales = async (req, res) => {
  try {
    const { shippingText, salesText } = req.body;

    const entry = new ShippingSales({ shippingText, salesText });
    await entry.save();

    res.status(201).json({ message: "Entry added successfully", data: entry });
  } catch (error) {
    res.status(500).json({ message: "Error adding entry", error: error.message });
  }
};

// Get All Entries
export const getShippingSales = async (req, res) => {
  try {
    const data = await ShippingSales.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

// Update Entry
export const updateShippingSales = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingText, salesText } = req.body;

    const updated = await ShippingSales.findByIdAndUpdate(
      id,
      { shippingText, salesText },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating entry", error: error.message });
  }
};

// Delete Entry
export const deleteShippingSales = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ShippingSales.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting entry", error: error.message });
  }
};
