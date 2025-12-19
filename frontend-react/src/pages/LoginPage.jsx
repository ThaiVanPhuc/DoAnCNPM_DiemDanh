import { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const navigate = useNavigate();

   const handleLogin = async () => {
  try {
    await login({ email, password });

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "ADMIN") {
      return navigate("/admin/dashboard", { replace: true });
    }

    navigate("/face-training", { replace: true });

  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="login-bg">
      <div className="login-card">
        <h3>Đăng nhập</h3>
        <p>Chào mừng bạn trở lại! Vui lòng đăng nhập.</p>

        <InputField
          label="Email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
        />

        <InputField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
        />

        <Button 
          text={loading ? "Đang đăng nhập..." : "Đăng nhập"} 
          onClick={handleLogin} 
          disabled={loading}

        />
        {error && 
          <div 
            className="alert alert-danger mt-3"
            style={{
              fontSize: "14px",
              padding: "6px 10px",
              borderRadius: "6px"
              }}
            >
          {error}
          </div>}
        <div className="text-center mt-3">
          Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
        </div>
      </div>
      
    </div>
  );
}
