const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const connectDB = require("./src/config/db.js");
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");


connectDB();

app.use(cors());
app.use(express.json());


// Tạo thư mục uploads nếu chưa có
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Endpoint upload ảnh
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Trả về URL ảnh
  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url });
});

// Phục vụ file tĩnh
app.use("/uploads", express.static(uploadDir));

// Các route khác
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.listen(5000, () => console.log("Backend chạy tại http://localhost:5000"));
