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
  res.json(shift);
};
