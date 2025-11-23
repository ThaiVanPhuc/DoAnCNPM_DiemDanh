const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên lớp, ví dụ: "CNTT-K65"
  description: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Danh sách sinh viên
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Class', classSchema);