import Message from "../../model/admin/messageModel.js";

// ✅ Create message
export const createMessage = async (req, res) => {
  try {
    const { fullName, phone, email, subject, message } = req.body;

    if (!fullName || !phone || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({ fullName, phone, email, subject, message });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error creating message", error: error.message });
  }
};


// ✅ Get all messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// ✅ Get single message by ID
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error fetching message", error: error.message });
  }
};

// ✅ Delete message
export const deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
};
