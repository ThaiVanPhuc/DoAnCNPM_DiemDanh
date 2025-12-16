const Class = require('../models/classModel');
const User = require('../models/userModel');

// [ADMIN + TEACHER] Tạo lớp
exports.createClass = async (req, res) => {
  try {
    const { className, description, teacherId } = req.body;

    if (!className) return res.status(400).json({ message: "Tên lớp không được để trống" });

    const exist = await Class.findOne({ className });
    if (exist) return res.status(400).json({ message: "Tên lớp đã tồn tại" });

    if (teacherId) {
      const teacher = await User.findOne({ _id: teacherId, role: 'TEACHER' });
      if (!teacher) return res.status(400).json({ message: "Giáo viên không tồn tại" });
    }

    const newClass = new Class({ className, description, teacherId: teacherId || null });
    await newClass.save();

    res.status(201).json({ message: "Tạo lớp thành công", class: newClass });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [ADMIN + TEACHER] Cập nhật lớp
exports.updateClass = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const updates = req.body;

    const updated = await Class.findOneAndUpdate({ classId }, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Lớp không tồn tại" });

    res.json({ message: "Cập nhật thành công", class: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [ADMIN] Xóa lớp
exports.deleteClass = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const deleted = await Class.findOneAndDelete({ classId });
    if (!deleted) return res.status(404).json({ message: "Lớp không tồn tại" });

    // Xóa classId khỏi tất cả học sinh
    await User.updateMany({ classId: deleted._id }, { $set: { classId: null } });

    res.json({ message: "Xóa lớp thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [ADMIN + TEACHER] Gán học sinh vào lớp
exports.assignUserToClass = async (req, res) => {
  try {
    const { userId, classId } = req.body;

    const user = await User.findOne({ userId: Number(userId) });
    if (!user) return res.status(404).json({ message: "Học sinh không tồn tại" });
    if (user.role !== 'STUDENT') return res.status(400).json({ message: "Chỉ gán được học sinh" });

    const cls = await Class.findOne({ classId: Number(classId) });
    if (!cls) return res.status(404).json({ message: "Lớp không tồn tại" });

    user.classId = cls._id;
    await user.save();

    // Cập nhật số lượng học sinh
    cls.studentCount = await User.countDocuments({ classId: cls._id });
    await cls.save();

    res.json({ message: "Gán lớp thành công", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xem danh sách học sinh trong lớp (ai cũng xem được nếu biết id)
exports.getStudentsByClass = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const cls = await Class.findOne({ classId }).populate('teacherId', 'fullName email');

    if (!cls) return res.status(404).json({ message: "Lớp không tồn tại" });

    const students = await User.find({ classId: cls._id })
      .select('userId fullName email phone avatarUrl')
      .sort('fullName');

    res.json({ class: cls, students, total: students.length });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy tất cả lớp (có populate giáo viên)
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'fullName email').sort('className');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};