const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    // Get token
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Add user info to Socket
    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

module.exports = socketAuth;
