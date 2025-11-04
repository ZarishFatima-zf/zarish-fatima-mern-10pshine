const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const logger = require("../logger"); 

// 🧾 GET /api/auth/:id — Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    logger.info({ userId }, "Fetching user profile");

    const user = await User.findById(userId).select("-password");
    if (!user) {
      logger.warn({ userId }, "User not found");
      return res.status(404).json({ message: "User not found" });
    }

    logger.info({ userId }, "User profile fetched successfully");
    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      image: user.image
        ? `http://localhost:5000/uploads/${path.basename(user.image)}`
        : null,
    });
  } catch (err) {
    logger.error({ err }, "Error fetching user profile");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✏️ PUT /api/auth/:id — Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, removeImage } = req.body;
    const userId = req.params.id;
    logger.info({ userId }, "Updating user profile");

    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for update");
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    // Handle image changes
    if (req.file) {
      if (user.image && fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
        logger.info({ userId }, "Old image deleted");
      }
      user.image = req.file.path;
      logger.info({ userId, image: user.image }, "New image uploaded");
    } else if (removeImage === "true") {
      if (user.image && fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
        logger.info({ userId }, "Image removed on request");
      }
      user.image = null;
    }

    const updatedUser = await user.save();
    logger.info({ userId }, "Profile updated successfully");

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
    logger.error({ err }, "Error updating user profile");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📸 POST /api/auth/:id/upload — Upload Image
exports.uploadImage = async (req, res) => {
  try {
    const userId = req.params.id;
    logger.info({ userId }, "Uploading image");

    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for image upload");
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      logger.warn({ userId }, "No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (user.image && fs.existsSync(user.image)) {
      fs.unlinkSync(user.image);
      logger.info({ userId }, "Old image deleted before uploading new one");
    }

    user.image = req.file.path;
    await user.save();

    logger.info({ userId, image: user.image }, "Image uploaded successfully");
    res.json({ message: "Image uploaded successfully", image: user.image });
  } catch (err) {
    logger.error({ err }, "Error uploading image");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ❌ DELETE /api/auth/:id/remove-image — Remove Image
exports.removeImage = async (req, res) => {
  try {
    const userId = req.params.id;
    logger.info({ userId }, "Removing image");

    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for image removal");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.image && fs.existsSync(user.image)) {
      fs.unlinkSync(user.image);
      logger.info({ userId }, "Image file deleted");
    }

    user.image = null;
    await user.save();

    logger.info({ userId }, "Image removed successfully");
    res.json({ message: "Image removed successfully" });
  } catch (err) {
    logger.error({ err }, "Error removing image");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
