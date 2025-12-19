// models/Class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shifts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
  ],
});

module.exports = mongoose.model("Class", classSchema);
