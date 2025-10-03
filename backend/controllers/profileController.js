const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// GET /api/auth/:id
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      image: user.image
        ? `http://localhost:5000/uploads/${path.basename(user.image)}`
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/auth/:id
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, removeImage } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    // Handle image upload
    if (req.file) {
      if (user.image && fs.existsSync(user.image)) fs.unlinkSync(user.image);
      user.image = req.file.path;
    } else if (removeImage === "true") {
      if (user.image && fs.existsSync(user.image)) fs.unlinkSync(user.image);
      user.image = null;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        image: updatedUser.image
          ? `http://localhost:5000/uploads/${path.basename(updatedUser.image)}`
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/:id/upload
exports.uploadImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    if (user.image && fs.existsSync(user.image)) fs.unlinkSync(user.image);

    user.image = req.file.path;
    await user.save();

    res.json({ message: "Image uploaded successfully", image: user.image });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/auth/:id/remove-image
exports.removeImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.image && fs.existsSync(user.image)) fs.unlinkSync(user.image);
    user.image = null;
    await user.save();

    res.json({ message: "Image removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
