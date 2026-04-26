const User = require("../models/User");
const logger = require("../logger");

// ➕ Add Note
exports.addNote = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ FIXED
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.notes.push({ title, content });
    await user.save();

    const newNote = user.notes[user.notes.length - 1];

    logger.info(`Note added for user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      note: newNote,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// 📖 Get Notes
exports.getNotes = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("notes");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      notes: user.notes || [],
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✏️ Update Note
exports.updateNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;
    const { title, content } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await user.save();

    res.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ❌ Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    note.deleteOne();
    await user.save();

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};