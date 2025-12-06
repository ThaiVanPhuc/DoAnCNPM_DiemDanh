const express = require("express");
const router = express.Router();

// Import các routes hiện có của bạn
// Ví dụ:
// const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes');
// const classRoutes = require('./class.routes');

// Import face training routes
const faceTrainingRoutes = require("./faceTraining");

// ==================== API ROUTES ====================

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Các routes hiện có của bạn
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/classes', classRoutes);

// Face Training routes
router.use("/face-training", faceTrainingRoutes);

// ==================== 404 HANDLER ====================
router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
