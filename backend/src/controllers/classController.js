const Class = require("../models/Class");
const User = require("../models/User");

exports.createClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newClass = await Class.create({ name, description });
    res.status(201).json({ message: "Tạo lớp thành công", data: newClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Lớp không tồn tại" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Lớp không tồn tại" });
    res.json({ message: "Xóa lớp thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignUserToClass = async (req, res) => {
  try {
    const { classId, userId } = req.body;
    const classObj = await Class.findById(classId);
    const user = await User.findById(userId);

    if (!classObj || !user)
      return res
        .status(404)
        .json({ error: "Không tìm thấy lớp hoặc sinh viên" });
    if (user.role !== "student")
      return res.status(400).json({ error: "Chỉ gán được sinh viên" });

    if (!classObj.students.includes(userId)) {
      classObj.students.push(userId);
      await classObj.save();
    }

    res.json({ message: "Gán sinh viên thành công", class: classObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersInClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id).populate(
      "students",
      "name email studentId"
    );
    if (!classObj) return res.status(404).json({ error: "Lớp không tồn tại" });
    res.json(classObj.students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
