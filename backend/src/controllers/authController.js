// src/controllers/authController.js
const User = require("../models/userModel");
const Class = require("../models/classModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, avatarUrl, address, gender, birthday, role, classId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

    let classObjectId = null;
    if (classId) {
      const cls = await Class.findOne({ classId: Number(classId) });
      if (!cls) return res.status(400).json({ message: "Lớp học không tồn tại" });
      classObjectId = cls._id;
    }

    const newUser = new User({
      fullName,
      email,
      password,
      phone,
      avatarUrl: avatarUrl || "",
      address: address || "",
      gender: gender || "male",
      birthday,
      role: role || "STUDENT",
      classId: classObjectId // Gán ObjectId đúng
    });

    await newUser.save();

    res.status(200).json({ message: "Đăng ký thành công", userId: newUser.userId });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        userId: user.userId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};