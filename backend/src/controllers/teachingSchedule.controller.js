// controllers/teachingSchedule.controller.js
const TeachingSchedule = require("../models/TeachingSchedule");
const User = require("../models/User");
const Shift = require("../models/Shift");
const checkConflict = require("../utils/checkScheduleConflict");

exports.createSchedule = async (req, res) => {
  const { classId, teacherId, subjectId, shiftId, weekStart, weekEnd } =
    req.body;

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "TEACHER") {
    return res.status(400).json({ message: "Invalid teacher" });
  }

  const shift = await Shift.findById(shiftId);
  if (!shift) return res.status(404).json({ message: "Shift not found" });

  const existing = await TeachingSchedule.find({
    $or: [{ teacherId }, { classId }],
  }).populate("shiftId");

  const conflict = checkConflict(existing, {
    shiftId: shift,
    weekStart,
    weekEnd,
  });

  if (conflict) {
    return res.status(400).json({ message: "Schedule conflict" });
  }

  const schedule = await TeachingSchedule.create({
    classId,
    teacherId,
    subjectId,
    shiftId,
    weekStart,
    weekEnd,
  });

  res.status(201).json(schedule);
};
