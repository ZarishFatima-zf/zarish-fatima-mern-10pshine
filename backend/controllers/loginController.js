const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logger = require("../logger"); 

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed - invalid password for: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    logger.info(`Login successful for user: ${email}`);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    logger.error({ error }, "Login Error");
    res.status(500).json({ message: "Server error" });
  }
};
