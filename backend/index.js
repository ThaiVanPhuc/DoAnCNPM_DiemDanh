// index.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const connectDB = require("./src/config/db.js");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const classRoutes = require("./src/routes/classRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const shiftRoutes = require("./src/routes/shift.routes.js");
const subjectsRoutes = require("./src/routes/subject.routes.js");
const teachingSchedulesRoutes = require("./src/routes/teachingSchedule.routes.js");
const apiRoutes = require("./src/routes/index");

// Connect DB (sẽ skip khi NODE_ENV=test)
connectDB();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Body limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/teaching-schedules", teachingSchedulesRoutes);

// Upload folder
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer (legacy upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ url });
});

app.use("/uploads", express.static(uploadDir));

// Face training API
app.use("/api", apiRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend running",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});


if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("=".repeat(70));
    console.log(`Node.js Backend running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${path.resolve(uploadDir)}`);
    console.log(`Python API should be running on http://localhost:5000`);
    console.log("=".repeat(70));
  });
}

module.exports = app;
