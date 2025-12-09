import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/header.css";
import { useState } from "react";

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <header className="header">
      <div className="logo"> FaceCheck System</div>

      <nav className="nav">
        <Link to="/">Home</Link>
      </nav>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>
          <FaSearch />
        </button>
        
      </div>
        
      <div className="auth-section">
        {!isLoggedIn ? (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        ) : (
          <>
         
            <button onClick={logout} className="logout-btn">
              Đăng xuất
            </button>
           
          </>
        )}
      </div>
       <Link to="/profile/user" className="profile-btn">
         Profile
        </Link>
    </header>
  );
}

export default Header;
