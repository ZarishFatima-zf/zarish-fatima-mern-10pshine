const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/signupController");
const { loginUser } = require("../controllers/loginController");
const { forgotPassword, resetPassword } = require("../controllers/forgot-resetController");





// Auth routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);





module.exports = router;
