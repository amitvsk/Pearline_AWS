import express from "express";
import {
  createMessage,
  getMessages,
  getMessageById,
  deleteMessage,
} from "../../controller/admin/messageController.js";

const router = express.Router();

// CRUD Endpoints
router.post("/", createMessage);     // Create message
router.get("/", getMessages);        // Get all messages
router.get("/:id", getMessageById);  // Get one message
router.delete("/:id", deleteMessage); // Delete message

export default router;
