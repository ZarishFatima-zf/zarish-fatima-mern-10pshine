const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // simple storage

// Controllers
const { registerUser } = require("../controllers/signupController");
const { loginUser } = require("../controllers/loginController");
const { forgotPassword, resetPassword } = require("../controllers/forgot-resetController");
const settingsController = require("../controllers/settingController");
const profileController = require("../controllers/profileController"); // ✅ add this

// Routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/change-password", settingsController.changePassword);
router.post("/delete-account", settingsController.deleteAccount);

// Profile routes
router.get("/:id", profileController.getProfile);
router.put("/:id", upload.single("image"), profileController.updateProfile);
router.post("/:id/upload", upload.single("image"), profileController.uploadImage);
router.delete("/:id/remove-image", profileController.removeImage);

module.exports = router;
