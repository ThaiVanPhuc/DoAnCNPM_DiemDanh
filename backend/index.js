// index.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const connectDB = require("./src/config/db.js");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const classRoutes = require("./src/routes/classRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");

// Import face training routes
const apiRoutes = require("./src/routes/index");

connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// Increased payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);

// Upload ảnh
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer cho legacy upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint upload ảnh (legacy)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ url });
});

app.use("/uploads", express.static(uploadDir));

// API Routes - Face Training (MUST BE BEFORE OTHER ROUTES)
app.use("/api", apiRoutes);

// Các route khác
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Backend running",
    endpoints: {
      faceTraining: "/api/face-training",
      users: "/api/users",
      auth: "/auth",
      health: "/health"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      nodejs: "running",
      python: "check http://localhost:5000"
    }
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Changed port to 3000 (avoid conflict with Python API on port 5000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("=".repeat(70));
  console.log(`Node.js Backend running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${path.resolve(uploadDir)}`);
  console.log(`Python API should be running on http://localhost:5000`);
  console.log(`Available endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/face-training/upload-face`);
  console.log(`   - POST /api/face-training/recognize-face`);
  console.log(`   - GET  /api/face-training/list-trained-people`);
  console.log("=".repeat(70));
});
