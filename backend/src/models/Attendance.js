const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  status: { type: String, enum: ['present', 'late', 'absent'], default: 'present' },
  timestamp: { type: Date, default: Date.now },
  confidence: Number
});

module.exports = mongoose.model('Attendance', attendanceSchema);