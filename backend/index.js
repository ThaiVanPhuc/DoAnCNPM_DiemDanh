const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const connectDB = require("./src/config/db");

const path = require("path");
const fs = require("fs");

// Import routes
const routes = require("./src/routes");

const PORT = process.env.PORT || 3000;
// Connect MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// CORS
app.use(
  cors({
    origin: "*", // Trong production nên chỉ định cụ thể domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files - Serve uploaded images
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Face Training API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      faceTraining: "/api/face-training",
      documentation: "/api/docs",
    },
  });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`📍 API:     http://localhost:${PORT}/api`);
  console.log(`📍 Face:    http://localhost:${PORT}/api/face-training`);
  console.log("=".repeat(50));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});

module.exports = app;
