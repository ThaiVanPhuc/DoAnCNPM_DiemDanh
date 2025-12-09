import React from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/header.jsx";
export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

 return (
    <>
      <Header />  {/* 🔥 Header được render ở top */}

      <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
        <h2 className="mb-4">Chào mừng {user?.name || "bạn"} đến với trang Home!</h2>
        {user?.email && <p className="mb-3">Email của bạn: {user.email}</p>}

        <Button text="Đăng xuất" onClick={handleLogout} />
      </div>
    </>
  );
}
