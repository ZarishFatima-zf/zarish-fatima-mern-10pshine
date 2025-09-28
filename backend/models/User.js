const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    image: { type: String, default: null }, // store file path or URL

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
