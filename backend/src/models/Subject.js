// models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
    },
    credits: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
