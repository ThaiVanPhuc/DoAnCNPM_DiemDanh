import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/header.css";

function Header() {
  const { username: user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">FaceCheck System</div>

      <div className="auth-section">
        <Link to="/profile/user" className="username profile-link">
          👋 {user?.username || "User"}
        </Link>

        <button onClick={handleLogout} className="logout-btn">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;
