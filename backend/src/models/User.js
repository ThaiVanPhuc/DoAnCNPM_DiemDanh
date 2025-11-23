const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' }
});

module.exports = mongoose.model('User', userSchema);