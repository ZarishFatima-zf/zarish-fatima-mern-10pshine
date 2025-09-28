const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/signupController");
const { loginUser } = require("../controllers/loginController");
const { forgotPassword, resetPassword } = require("../controllers/forgot-resetController");
const settingsController = require("../controllers/settingController"); // ✅ FIXED

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);



// Change password
router.post("/change-password", settingsController.changePassword);
router.post("/delete-account", settingsController.deleteAccount);
module.exports = router;
