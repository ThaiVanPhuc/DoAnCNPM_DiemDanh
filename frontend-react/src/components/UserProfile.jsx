import React, { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import "../assets/styles/UserProfile.css";

export default function UserProfile({ userId, onEdit }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(userId);
        setUser(res);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <p className="text-center mt-4">Đang tải thông tin...</p>;
  if (error) return <p className="text-center mt-4 text-danger">{error}</p>;
  if (!user) return <p className="text-center mt-4">Không tìm thấy người dùng.</p>;

  return (
    <div className="container mt-5">
      <div className="card profile-card shadow-lg mx-auto">
        {/* Header */}
        <div className="profile-header text-center p-4" style={{ background: "linear-gradient(135deg, #6a5acd, #836fff)", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
          <img
            src={user.avatarUrl }
            alt="avatar"
            className="profile-avatar mb-3"
          />
          <h3 className="text-white fw-bold">{user.fullName}</h3>
            <p className="text-white">
            {user.role === "STUDENT" ? "Sinh viên" :
            user.role === "TEACHER" ? "Giáo viên" :
                user.role === "ADMIN" ? "Quản trị viên" :
                "Khác"
            }
            </p>
          <button className="btn btn-light btn-sm mt-2" onClick={onEdit}>
            Chỉnh sửa
          </button>
        </div>

        {/* Body */}
        <div className="card-body p-4">
          <div className="row mb-3">
            <div className="col-sm-4 text-muted fw-bold">Email:</div>
            <div className="col-sm-8">{user.email}</div>
          </div>
          <div className="row mb-3">
            <div className="col-sm-4 text-muted fw-bold">SĐT:</div>
            <div className="col-sm-8">{user.phone || "-"}</div>
          </div>
          <div className="row mb-3">
            <div className="col-sm-4 text-muted fw-bold">Địa chỉ:</div>
            <div className="col-sm-8">{user.address || "-"}</div>
          </div>
          <div className="row mb-3">
            <div className="col-sm-4 text-muted fw-bold">Giới tính:</div>
            <div className="col-sm-8">{user.gender === "male" ? "Nam" : "Nữ"}</div>
          </div>
          <div className="row mb-3">
            <div className="col-sm-4 text-muted fw-bold">Ngày sinh:</div>
            <div className="col-sm-8">{user.birthday?.slice(0, 10) || "-"}</div>
          </div>
          <div className="row">
            <div className="col-sm-4 text-muted fw-bold">UserID:</div>
            <div className="col-sm-8">{user.userId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
