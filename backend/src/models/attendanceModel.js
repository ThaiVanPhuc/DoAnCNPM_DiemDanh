// src/models/attendanceModel.js
const mongoose = require('mongoose');
const Counter = require('./counterModel');

const attendanceSchema = new mongoose.Schema({
  attendanceId: { 
    type: Number, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  timeIn: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['present', 'late', 'absent'], 
    default: 'absent' 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

// DUY NHẤT 1 PRE-SAVE HOOK – TĂNG ATTENDANCEID
attendanceSchema.pre('save', { document: true, query: false }, async function () {
  try {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'attendance' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.attendanceId = counter.seq;
    }
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);