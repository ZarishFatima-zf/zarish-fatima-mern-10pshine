const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/signupController");
const { loginUser } = require("../controllers/loginController");
const { forgotPassword, resetPassword } = require("../controllers/forgot-resetController");
const { getProfile, updateProfile } = require("../controllers/profileController");
// Auth routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Direct access with userId
router.get("/:id", getProfile);
router.put("/:id", updateProfile);



module.exports = router;
