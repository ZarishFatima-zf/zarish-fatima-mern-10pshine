const User = require("../models/User");
const logger = require("../logger"); // ✅ Import Pino logger

// ➕ Add Note
exports.addNote = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId || !title) {
      logger.warn("Missing userId or title in request body");
      return res.status(400).json({ success: false, message: "userId and title are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.notes.push({ title, content });
    await user.save();

    const newNote = user.notes[user.notes.length - 1];
    logger.info(`New note added by user ${userId}: "${title}"`);

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      note: newNote,
    });
  } catch (err) {
    logger.error({ msg: "Add Note Error", error: err.message });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// 📖 Get All Notes for a User
exports.getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("notes");

    if (!user) {
      logger.warn(`User not found while fetching notes: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    logger.info(`Fetched ${user.notes.length} notes for user ${userId}`);
    res.json({
      success: true,
      notes: user.notes || [],
    });
  } catch (err) {
    logger.error({ msg: "Get Notes Error", error: err.message });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✏️ Update Note
exports.updateNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;
    const { title, content } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for update: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      logger.warn(`Note not found for user ${userId} with ID: ${noteId}`);
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await user.save();
    logger.info(`Note ${noteId} updated by user ${userId}`);

    res.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (err) {
    logger.error({ msg: "Update Note Error", error: err.message });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ❌ Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for delete: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      logger.warn(`Note not found for deletion (User: ${userId}, Note: ${noteId})`);
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    note.deleteOne();
    await user.save();

    logger.info(`Note ${noteId} deleted by user ${userId}`);
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    logger.error({ msg: "Delete Note Error", error: err.message });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
