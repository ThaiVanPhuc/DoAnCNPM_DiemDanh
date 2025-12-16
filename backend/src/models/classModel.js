// src/models/classModel.js
const mongoose = require("mongoose");

// Require Counter từ file riêng
const Counter = require("./counterModel");

const classSchema = new mongoose.Schema(
  {
    classId: {
      type: Number,
      unique: true,
    },
    className: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    studentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Tự động tăng classId
classSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'class' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.classId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Class", classSchema);
