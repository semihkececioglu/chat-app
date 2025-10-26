const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentias: true,
  },
});

// Make io accessible to routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// TEST: Static files serve et
app.use("/test", express.static("test"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Socket.io middleware (authentication)
io.use(require("./middleware/socketAuth"));

const messageHandler = require("./socket/messageHandler");

// Online users tracking
const onlineUsers = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.username);

  // Make user online
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);

  // Make the user online in the database
  socket.user.online = true;
  socket.user.save();

  // Notify all users that this user is online
  io.emit("user_online", {
    userId: userId,
    username: socket.user.username,
  });

  // Send online users list
  socket.emit("online_users", Array.from(onlineUsers.keys()));

  // Add message handler
  messageHandler(io, socket, onlineUsers);

  // When disconnected
  socket.on("disconnet", async () => {
    console.log("User disconnected:", socket.user.username);

    // Remove from online users
    onlineUsers.delete(userId);

    // Take database offline
    socket.user.online = false;
    socket.user.lastSeen = new Date();
    await socket.user.save();

    // Notify all users that you are offline
    io.emit("user_offline", {
      userId: userId,
      username: socket.user.username,
      lastSeen: socket.user.lastSeen,
    });
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.io is ready");
});
