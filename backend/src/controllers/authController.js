const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    // Lấy toàn bộ dữ liệu từ req.body
    const { fullName, email, password, phone, avatarUrl, address, gender, birthday, role, classId } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    // Tạo user mới
    const newUser = new User({
      fullName,
      email,
      password,       // sẽ hash tự động nhờ pre-save hook
      phone,
      avatarUrl: avatarUrl || "",
      address: address || "",
      gender: gender || "male",           // default male
      birthday,
      role: role || "STUDENT",            // default STUDENT
      classId: classId || null
    });

    await newUser.save();

    res.status(200).json({ message: "Đăng ký thành công", userId: newUser.userId });
  } catch (error) {
    console.error(error); // in lỗi ra console để debug
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo JWT
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

    res.status(500).json({ message: "Lỗi server",  error: error.message });
  }
};
