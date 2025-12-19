// models/Shift.js
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
