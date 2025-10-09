const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const logger = require("../logger"); 

// ---------- FORGOT PASSWORD ----------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Forgot password request received for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`No user found with email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Notezy Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Hello ${user.fullName},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    logger.info(`Password reset email sent successfully to: ${user.email}`);
    res.json({ message: "Password reset email sent" });

  } catch (error) {
    logger.error({ error }, "Forgot Password Error");
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- RESET PASSWORD ----------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    logger.info(`Reset password attempt with token: ${token}`);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("Invalid or expired token used for password reset");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);
    res.json({ message: "Password reset successful" });

  } catch (error) {
    logger.error({ error }, "Reset Password Error");
    res.status(500).json({ message: "Server error" });
  }
};
