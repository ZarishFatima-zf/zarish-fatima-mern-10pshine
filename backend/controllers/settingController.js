const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logger = require("../logger"); 

// 🔐 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;
    logger.info({ userId }, "Password change attempt initiated");

    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found during password change");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn({ userId }, "Old password is incorrect");
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (newPassword !== confirmPassword) {
      logger.warn({ userId }, "Passwords do not match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      logger.warn({ userId }, "New password too short");
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      logger.warn({ userId }, "New password same as old password");
      return res
        .status(400)
        .json({ message: "New password cannot be the same as old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info({ userId }, "Password updated successfully");
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error({ error }, "Change Password Error");
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    logger.info({ userId }, "Delete account request received");

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn({ userId }, "User not found during account deletion");
      return res.status(404).json({ message: "User not found" });
    }

    logger.info({ userId }, "Account deleted successfully");
    res.status(204).send();
  } catch (error) {
    logger.error({ error }, "Delete Account Error");
    res.status(500).json({ message: "Server error" });
  }
};
