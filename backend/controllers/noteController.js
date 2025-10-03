const User = require("../models/User");

// ➕ Add Note
exports.addNote = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: "userId and title are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.notes.push({ title, content });
    await user.save();

    const newNote = user.notes[user.notes.length - 1];
    res.status(201).json({
      success: true,
      message: "Note added successfully",
      note: newNote,
    });
  } catch (err) {
    console.error("Add Note Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// 📖 Get All Notes for a User
exports.getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("notes");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      notes: user.notes || [],
    });
  } catch (err) {
    console.error("Get Notes Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✏️ Update Note
exports.updateNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;
    const { title, content } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const note = user.notes.id(noteId);
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    if (title) note.title = title;
    if (content) note.content = content;

    await user.save();
    res.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (err) {
    console.error("Update Note Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ❌ Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const { userId, noteId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const note = user.notes.id(noteId);
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    note.deleteOne();
    await user.save();

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete Note Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
