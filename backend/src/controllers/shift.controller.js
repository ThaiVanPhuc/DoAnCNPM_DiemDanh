// controllers/shift.controller.js
const Shift = require("../models/Shift");

exports.createShift = async (req, res) => {
  const shift = await Shift.create(req.body);
  res.status(201).json(shift);
};

exports.updateShift = async (req, res) => {
  const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }

  res.json(shift);
};

exports.getAllShifts = async (req, res) => {
  const shifts = await Shift.find().sort({ dayOfWeek: 1, startTime: 1 });
  res.json(shifts);
};

exports.getShiftById = async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }
  res.json(shift);
};

exports.deleteShift = async (req, res) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);

  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }

  res.json({ message: "Shift deleted successfully" });
};
