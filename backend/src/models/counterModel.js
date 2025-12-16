// src/models/counterModel.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // ví dụ: 'user', 'class'
  seq: { type: Number, default: 0 },
});

// Chỉ định nghĩa model Counter một lần duy nhất ở toàn bộ dự án
module.exports = mongoose.model("Counter", counterSchema);
