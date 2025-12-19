// controllers/class.controller.js
const Class = require("../models/Class");
const Shift = require("../models/Shift");
const checkConflict = require("../utils/checkShiftConflict");

exports.assignShiftToClass = async (req, res) => {
  const { shiftId } = req.body;
  const cls = await Class.findById(req.params.classId).populate("shifts");

  if (!cls) return res.status(404).json({ message: "Class not found" });

  const shift = await Shift.findById(shiftId);
  if (!shift) return res.status(404).json({ message: "Shift not found" });

  const conflict = checkConflict(cls.shifts, shift);
  if (conflict) {
    return res.status(400).json({ message: "Class shift conflict" });
  }

  cls.shifts.push(shiftId);
  await cls.save();

  res.json(cls);
};
