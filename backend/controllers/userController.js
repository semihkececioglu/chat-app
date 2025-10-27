const User = require("../models/User");

// Get all users (except current user)
const getUsers = async (req, res) => {
  try {
    // Get all users
    const allUsers = await User.find({})
      .select("-password")
      .sort({ username: 1 });

    // Filter out current user
    const users = allUsers.filter(
      (u) => u._id.toString() !== req.user._id.toString()
    );

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
};
