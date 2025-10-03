const mongoose = require("mongoose");

// Subdocument schema for notes
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
  },
  { timestamps: true }
);

// User schema with embedded notes
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    image: { type: String, default: null }, // store file path or URL

    // Embed notes inside the user
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
