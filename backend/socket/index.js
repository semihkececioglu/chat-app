const socketIO = require("socket.io");
const socketAuth = require("../middleware/socketAuth"); // Ayrı middleware kullan
const messageHandler = require("./messageHandler"); // Handler'ı kullan

// Online users tracking
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const io = socketIO(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // socketAuth middleware'i kullan
  io.use(socketAuth);

  // Connection handler
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.username, socket.id);

    // Add to online users
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Join user's personal room
    socket.join(userId);

    // Update database
    socket.user.online = true;
    socket.user.save();

    // Emit online users
    const onlineUsersList = Array.from(onlineUsers.keys());
    io.emit("online_users", onlineUsersList);

    // Broadcast user online
    socket.broadcast.emit("user_online", {
      userId: userId,
      username: socket.user.username,
    });

    // messageHandler'ı başlat
    messageHandler(io, socket, onlineUsers);

    // Disconnect
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user.username);

      // Remove from online users
      onlineUsers.delete(userId);

      // Update database
      socket.user.online = false;
      socket.user.lastSeen = new Date();
      await socket.user.save();

      io.emit("user_offline", {
        userId: userId,
        lastSeen: socket.user.lastSeen,
      });
    });
  });

  console.log("Socket.io initialized");
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = initSocket;
module.exports.getIO = getIO;
