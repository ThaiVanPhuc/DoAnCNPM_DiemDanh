const express = require("express");
const router = express.Router();

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

// Face Training routes
router.use("/face-training", faceTrainingRoutes);

module.exports = router;