// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Test role
router.get("/admin", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => {
  res.json({ message: "Welcome admin!" });
});

module.exports = router;