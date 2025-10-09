const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logger = require("../logger"); 

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    logger.info({ email }, "User registration attempt received");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn({ email }, "Registration failed - Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    logger.info({ userId: newUser._id, email }, "User registered successfully");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error({ error }, "Signup Error");
    res.status(500).json({ message: "Server error" });
  }
};
