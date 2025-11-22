const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// API test
app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.listen(5000, () => console.log("Backend chạy tại http://localhost:5000"));
