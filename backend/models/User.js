const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profilePic: { type: String, default: "" } // image ka path save hoga

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
