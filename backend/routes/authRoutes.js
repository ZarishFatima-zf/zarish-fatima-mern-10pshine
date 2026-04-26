const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Controllers
const { registerUser } = require("../controllers/signupController");
const { loginUser } = require("../controllers/loginController");
const { forgotPassword, resetPassword } = require("../controllers/forgot-resetController");
const settingsController = require("../controllers/settingController");
const profileController = require("../controllers/profileController");
const noteController = require("../controllers/noteController");

// Auth
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Settings
router.post("/change-password", settingsController.changePassword);
router.post("/delete-account", settingsController.deleteAccount);

// Profile
router.get("/:id", profileController.getProfile);
router.put("/:id", upload.single("image"), profileController.updateProfile);
router.post("/:id/upload", upload.single("image"), profileController.uploadImage);
router.delete("/:id/remove-image", profileController.removeImage);

// Notes ✅ FIXED REST STYLE
router.post("/users/:userId/notes", noteController.addNote);
router.get("/users/:userId/notes", noteController.getNotes);
router.put("/users/:userId/notes/:noteId", noteController.updateNote);
router.delete("/users/:userId/notes/:noteId", noteController.deleteNote);

module.exports = router;