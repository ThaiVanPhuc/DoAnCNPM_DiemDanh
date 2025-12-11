import { useState, useEffect } from "react";
import InputField from "../components/InputField";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../assets/styles/LoginPage.css"; 

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  const [success, setSuccess] = useState("");
  const [errorForm, setErrorForm] = useState(""); // ⬅ thêm state lỗi form

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatarUrl: "",
    address: "",
    gender: "male",
    birthday: "",
    classId: "",
  });

  useEffect(() => {
    const fetchClasses = () => {
      const mockClasses = [
        { id: 1, name: "ST22A" },
        { id: 2, name: "ST22B" },
        { id: 3, name: "ST22C" },
      ];
      setClasses(mockClasses);
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setErrorForm("");
    setSuccess("");

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.phone ||
      !form.address ||
      !form.birthday 
      ) {
      setErrorForm("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // kiểm tra mật khẩu
    if (form.password !== form.confirmPassword) {
      setErrorForm("Mật khẩu xác nhận không khớp!");
      return;
    }

    const requestData = { ...form, role: "STUDENT" };
    delete requestData.confirmPassword;

    try {
      await register(requestData);
      setSuccess("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-bg">
      <div
        className="login-card"
        style={{
          width: "900px",
          maxWidth: "100%",
          padding: "1rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h3>Đăng ký tài khoản</h3>

        {errorForm && (
          <div className="alert alert-danger p-2" style={{ fontSize: "14px" }}>
            {errorForm}
          </div>
        )}

        {error && (
          <div className="alert alert-danger p-2" style={{ fontSize: "14px" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success p-2" style={{ fontSize: "14px" }}>
            {success}
          </div>
        )}

        <div style={{ display: "flex", gap: "20px", width: "100%" }}>
          {/* Cột trái */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <InputField label="Họ và tên" type="text" value={form.fullName} 
              onChange={handleChange} name="fullName" placeholder="Nhập họ và tên" className="transparent-input" />

            <InputField label="Email" type="email" value={form.email}
              onChange={handleChange} name="email" placeholder="Nhập email" className="transparent-input" />

            <InputField label="Mật khẩu" type="password" value={form.password}
              onChange={handleChange} name="password" placeholder="Nhập mật khẩu" className="transparent-input" />

            <InputField label="Xác nhận mật khẩu" type="password" value={form.confirmPassword}
              onChange={handleChange} name="confirmPassword" placeholder="Nhập lại mật khẩu" className="transparent-input" />

            <div className="mb-3">
              <label className="form-label" style={{ color: "#fff" }}>Giới tính</label>
              <select name="gender" className="form-select transparent-input"
                value={form.gender} onChange={handleChange}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Cột phải */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
            <InputField label="Ngày sinh" type="date" value={form.birthday}
              onChange={handleChange} name="birthday" className="transparent-input" />

            <InputField label="Số điện thoại" type="text" value={form.phone}
              onChange={handleChange} name="phone" placeholder="Nhập số điện thoại" className="transparent-input" />

            <InputField label="Địa chỉ" type="text" value={form.address}
              onChange={handleChange} name="address" placeholder="Nhập địa chỉ" className="transparent-input" />

            <InputField label="Ảnh đại diện (URL)" type="text" value={form.avatarUrl}
              onChange={handleChange} name="avatarUrl" placeholder="Nhập URL ảnh đại diện" className="transparent-input" />

            <div className="mb-3">
              <label className="form-label" style={{ color: "#fff" }}>Chọn lớp</label>
              <select name="classId" className="form-select transparent-input"
                value={form.classId} onChange={handleChange}>
                <option value="">-- Chọn lớp --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ width: "400px", marginTop: "10px" }}>
          <button className="gradient-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </div>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          Bạn đã có tài khoản? <a href="/login">Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}
