const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, messageController.sendMessage);
router.get("/:userId", protect, messageController.getMessages);
router.get("/conversations", protect, messageController.getConversations);

module.exports = router;
