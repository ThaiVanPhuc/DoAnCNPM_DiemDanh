// UserProfileForm.js
import React, { useState, useEffect } from "react";
import { updateUser, getUserById } from "../services/userService";
import "../assets/styles/UserProfileForm.css";

export default function UserProfileForm({ userId, onSave, onCancel }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "male",
    birthday: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setForm({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          gender: userData.gender || "male",
          birthday: userData.birthday?.slice(0, 10) || "",
          avatarUrl: userData.avatarUrl || "",
        });
        setAvatarPreview(userData.avatarUrl || "https://i.pravatar.cc/150");
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu user.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "avatarUrl") setAvatarPreview(value || "https://i.pravatar.cc/150");
  };

  // Upload file lên server và lấy URL
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload thất bại");
      const data = await res.json();
      setForm((prev) => ({ ...prev, avatarUrl: data.url }));
      setAvatarPreview(data.url);
    } catch (err) {
      console.error(err);
      alert("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser(userId, form);
      onSave(updatedUser);
    } catch (err) {
      console.error(err);
      setError("Cập nhật thất bại.");
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center mt-4 text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow profile-form-card mx-auto">
        <div className="card-header text-center bg-info text-white">
          <h4>Chỉnh sửa</h4>
        </div>
        <div className="card-body">
          <div className="text-center mb-4">
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="avatar-preview mb-3"
              style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* File upload */}
            <div className="mb-3">
              <label className="form-label">Chọn ảnh:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
                disabled={uploading}
              />
              {uploading && <p>Đang upload...</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Avatar URL (tự nhập nếu muốn):</label>
              <input
                type="text"
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Các trường còn lại */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Họ và tên:</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">SĐT:</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ:</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Giới tính:</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày sinh:</label>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-success">
                Lưu
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
