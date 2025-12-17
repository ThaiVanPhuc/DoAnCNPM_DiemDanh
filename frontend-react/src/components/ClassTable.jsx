// src/components/ClassTable.jsx
import { useState, useEffect } from "react";
import MyPagination from "./Pagination";
import "../assets/styles/UserTable.css";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  assignStudentToClass,
} from "../services/classService";
import { getAllUsers } from "../services/userService"; // Để lấy danh sách học sinh

export default function ClassTable() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classRes, userRes] = await Promise.all([
          getAllClasses(),
          getAllUsers(),
        ]);

        setClasses(classRes);
        // Lọc chỉ học sinh để gán lớp
        setStudents(userRes.filter((u) => u.role === "STUDENT"));
      } catch (err) {
        setError("Không thể tải dữ liệu lớp học");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingClass(null);
    setOpenModal(true);
  };

  const openEdit = (cls) => {
    setEditingClass(cls);
    setOpenModal(true);
  };

  const openAssign = (cls) => {
    setSelectedClass(cls);
    setOpenAssignModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingClass) {
        await updateClass(editingClass.classId, formData);
      } else {
        await createClass(formData);
      }
      // Refresh danh sách lớp
      const updatedClasses = await getAllClasses();
      setClasses(updatedClasses);
      setOpenModal(false);
    } catch (err) {
      alert("Lỗi khi lưu lớp học: " + (err.message || "Unknown error"));
    }
  };

  const handleAssign = async (studentUserId) => {
    if (!studentUserId) return;
    try {
      await assignStudentToClass({
        userId: studentUserId,
        classId: selectedClass.classId,
      });
      alert("Gán học sinh thành công!");
      setOpenAssignModal(false);
      const updatedClasses = await getAllClasses();
      setClasses(updatedClasses);
    } catch (err) {
      alert("Gán học sinh thất bại: " + (err.message || ""));
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Xóa lớp này? Tất cả học sinh sẽ bị bỏ lớp!")) return;
    try {
      await deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
    } catch (err) {
      alert("Xóa lớp thất bại");
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý Lớp học</h2>
        <button className="btn btn-purple px-4" onClick={openAdd}>
          + Thêm lớp mới
        </button>
      </div>

      {/* Loading & Error */}
      {loading && <p className="text-center">Đang tải dữ liệu...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      {/* TABLE */}
      <table className="table table-hover align-middle custom-table">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Mã lớp</th>
            <th>Tên lớp</th>
            <th>Mô tả</th>
            <th>Giáo viên chủ nhiệm</th>
            <th>Sĩ số</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((cls, index) => (
            <tr key={cls._id}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="fw-semibold">{cls.classId}</td>
              <td>{cls.className}</td>
              <td>{cls.description || "-"}</td>
              <td>{cls.teacherId ? cls.teacherId.fullName : "Chưa có"}</td>
              <td>
                <span className="badge bg-success fs-6">{cls.studentCount || 0}</span>
              </td>
              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => openAssign(cls)}
                >
                  Gán HS
                </button>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => openEdit(cls)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(cls.classId)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <MyPagination
          data={classes}
          itemsPerPage={itemsPerPage}
          onPageDataChange={setPageData}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal thêm/sửa lớp */}
      {openModal && (
        <ClassModal
          onClose={() => setOpenModal(false)}
          onSubmit={handleSubmit}
          initialData={editingClass}
        />
      )}

      {/* Modal gán học sinh */}
      {openAssignModal && (
        <AssignStudentModal
          classData={selectedClass}
          students={students}
          onAssign={handleAssign}
          onClose={() => setOpenAssignModal(false)}
        />
      )}
    </div>
  );
}

/* ------------------- Modal thêm/sửa lớp ------------------- */
function ClassModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    className: initialData?.className || "",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      className: form.className.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? "Cập nhật lớp học" : "Thêm lớp học mới"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold">Tên lớp *</label>
                  <input
                    name="className"
                    value={form.className}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ví dụ: 10A1"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Mô tả lớp học (tùy chọn)"
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {initialData ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------- Modal gán học sinh ------------------- */
function AssignStudentModal({ classData, students, onAssign, onClose }) {
  const [selectedStudent, setSelectedStudent] = useState("");

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                Gán học sinh vào lớp: <strong>{classData?.className}</strong>
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <label className="form-label fw-bold">Chọn học sinh</label>
              <select
                className="form-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Chọn học sinh --</option>
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.fullName} ({s.email}) {s.classId ? "- Đã có lớp" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button
                className="btn btn-success"
                disabled={!selectedStudent}
                onClick={() => onAssign(selectedStudent)}
              >
                Gán vào lớp
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}