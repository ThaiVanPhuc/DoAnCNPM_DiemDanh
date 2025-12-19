// src/models/classModel.js
const mongoose = require("mongoose");
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
      default: null,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// DUY NHẤT 1 PRE-SAVE HOOK – TĂNG CLASSID
classSchema.pre('save', { document: true, query: false }, async function () {
  try {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'class' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.classId = counter.seq;
    }
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model("Class", classSchema);