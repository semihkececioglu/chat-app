const express = require("express");
const {
  getMessages,
  getConversations,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessages);
router.post("/", protect, sendMessage);

module.exports = router;
