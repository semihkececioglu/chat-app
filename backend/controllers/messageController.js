const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Get conversation messages
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Fetch messages between two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username avatar online lastSeen")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message (REST API - for backup)
const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user._id;

    // Save message
    const message = await Message.create({
      sender,
      receiver,
      content,
      type: "text",
    });

    // Populate
    await message.populate("sender", "username avatar");
    await message.populate("receiver", "username avatar");

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiver],
        lastMessage: message._id,
      });
    } else {
      conversation.lastMessage = message._id;
      await conversation.save();
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
};
