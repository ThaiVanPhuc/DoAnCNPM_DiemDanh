import { useState, useEffect } from "react";
import "../assets/styles/FormModal.css";

export default function FormModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    avatarUrl: "",  // Lưu URL thay vì Base64
    address: "",
    gender: "male",
    birthday: "",
    role: "STUDENT",
    classId: "",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        birthday: initialData.birthday
          ? new Date(initialData.birthday).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Upload file lên server
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
    } catch (err) {
      console.error(err);
      alert("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      classId:
        form.classId === "" || form.classId === null
          ? null
          : !isNaN(Number(form.classId))
          ? Number(form.classId)
          : null,
    };
    onSubmit(payload);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">{initialData ? "Cập nhật người dùng" : "Thêm người dùng"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <form id="user-form" onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="form-control"
                    required
                  />
                </div>
                {!initialData && (
                  <div className="col-12">
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="form-control"
                      required
                    />
                  </div>
                )}
                <div className="col-6">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="form-control"
                  />
                </div>

                {/* Avatar */}
                <div className="col-6">
                  <input
                    type="text"
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="Avatar URL"
                    className="form-control mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-control"
                    disabled={uploading}
                  />
                  {uploading && <p>Đang upload...</p>}
                  {form.avatarUrl && (
                    <img
                      src={form.avatarUrl}
                      alt="avatar preview"
                      className="mt-2"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
                    />
                  )}
                </div>

                <div className="col-12">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="form-control"
                  />
                </div>

                <div className="col-6">
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

                <div className="col-6">
                  <input
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-6">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="STUDENT">Sinh viên</option>
                    <option value="TEACHER">Giáo viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>

                <div className="col-6">
                  <input
                    name="classId"
                    value={form.classId}
                    onChange={handleChange}
                    placeholder="Class ID (nếu là student)"
                    className="form-control"
                  />
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
              <button type="submit" form="user-form" className="btn btn-primary">
                {initialData ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
