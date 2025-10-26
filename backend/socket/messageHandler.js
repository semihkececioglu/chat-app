const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

/**
 * Handle all message-related socket events
 * @param {object} io - Socket.io server instance
 * @param {object} socket - Individual socket connection
 * @param {Map} onlineUsers - Map of online users (userId -> socketId)
 */
const messageHandler = (io, socket, onlineUsers) => {
  console.log("MessageHandler initialized for:", socket.user.username);

  // Join conversation room
  socket.on("join_conversation", (userId) => {
    // Create consistent room ID by sorting user IDs
    const roomId = [socket.user._id.toString(), userId].sort().join("_");
    socket.join(roomId);

    console.log(`${socket.user.username} joined room: ${roomId}`);
    console.log(
      `User ${socket.user.username} is now in rooms:`,
      Array.from(socket.rooms)
    );
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("NEW MESSAGE EVENT");
      console.log("From:", socket.user.username);
      console.log("Data:", data);

      const { receiverId, content } = data;
      const senderId = socket.user._id;

      // Save message to database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        type: "text",
      });

      console.log("Message saved to DB with ID:", message._id);

      // Populate sender and receiver info
      await message.populate("sender", "username avatar");
      await message.populate("receiver", "username avatar");

      console.log("Sender:", message.sender.username);
      console.log("Receiver:", message.receiver.username);

      // Update or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          lastMessage: message._id,
        });
        console.log("New conversation created");
      } else {
        conversation.lastMessage = message._id;
        await conversation.save();
        console.log("Conversation updated");
      }

      // Calculate room ID (must match join_conversation logic)
      const roomId = [senderId.toString(), receiverId].sort().join("_");
      console.log("Room ID:", roomId);
      console.log("Currently online users:", Array.from(onlineUsers.entries()));

      // Get all sockets in this room
      const socketsInRoom = await io.in(roomId).fetchSockets();
      console.log(
        "Sockets in room:",
        socketsInRoom.map((s) => s.id)
      );

      console.log('Emitting "receive_message" to room:', roomId);

      // Emit message to everyone in the room (including sender)
      io.to(roomId).emit("receive_message", message);

      console.log("Message emitted to room successfully");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Also send direct notification to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        console.log(
          "Sending notification to receiver socket:",
          receiverSocketId
        );
        io.to(receiverSocketId).emit("new_message_notification", {
          message,
          sender: socket.user,
        });
      } else {
        console.log("Receiver is not online");
      }
    } catch (error) {
      console.error("Message error:", error);
      socket.emit("message_error", { message: error.message });
    }
  });

  // Typing indicators
  socket.on("typing_start", (receiverId) => {
    console.log("Typing start:", socket.user.username, "→", receiverId);
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", {
        userId: socket.user._id,
        username: socket.user.username,
      });
    }
  });

  socket.on("typing_stop", (receiverId) => {
    console.log("Typing stop:", socket.user.username);
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stop_typing", {
        userId: socket.user._id,
      });
    }
  });

  // Mark messages as read
  socket.on("mark_as_read", async (messageIds) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { read: true, readAt: new Date() }
      );

      socket.emit("messages_marked_read", messageIds);
      console.log("Messages marked as read:", messageIds.length);
    } catch (error) {
      socket.emit("message_error", { message: error.message });
    }
  });
};

module.exports = messageHandler;
