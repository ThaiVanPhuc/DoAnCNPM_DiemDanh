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
  getStudentsInClass,
  removeStudentFromClass, // MỚI
} from "../services/classService";
import { getAllUsers } from "../services/userService";

export default function ClassTable() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [openAssignStudentModal, setOpenAssignStudentModal] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState(null);

  const [openViewMembersModal, setOpenViewMembersModal] = useState(false);
  const [selectedClassForView, setSelectedClassForView] = useState(null);

  const [openAssignTeacherModal, setOpenAssignTeacherModal] = useState(false);
  const [classForTeacherAssign, setClassForTeacherAssign] = useState(null);

  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classRes, userRes] = await Promise.all([
          getAllClasses(),
          getAllUsers(),
        ]);

        setClasses(classRes);
        setTeachers(userRes.filter((u) => u.role === "TEACHER"));
        setStudents(userRes.filter((u) => u.role === "STUDENT"));
      } catch (err) {
        alert("Lỗi tải dữ liệu lớp học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingClass(null);
    setOpenAddEditModal(true);
  };

  const openEdit = (cls) => {
    setEditingClass(cls);
    setOpenAddEditModal(true);
  };

  const openAssignStudent = (cls) => {
    setSelectedClassForAssign(cls);
    setOpenAssignStudentModal(true);
  };

  const openViewMembers = (cls) => {
    setSelectedClassForView(cls);
    setOpenViewMembersModal(true);
  };

  const openAssignTeacher = (cls) => {
    setClassForTeacherAssign(cls);
    setOpenAssignTeacherModal(true);
  };

  const handleSaveClass = async (formData) => {
    try {
      if (editingClass) {
        await updateClass(editingClass.classId, formData);
      } else {
        await createClass(formData);
      }
      const updated = await getAllClasses();
      setClasses(updated);
      setOpenAddEditModal(false);
    } catch (err) {
      alert("Lỗi lưu lớp học");
    }
  };

  const handleAssignStudent = async (studentUserId) => {
    try {
      await assignStudentToClass({
        userId: studentUserId,
        classId: selectedClassForAssign.classId,
      });
      alert("Gán học sinh thành công!");
      setOpenAssignStudentModal(false);
      const updated = await getAllClasses();
      setClasses(updated);
    } catch (err) {
      alert("Gán học sinh thất bại");
    }
  };

  const handleAssignTeacher = async (teacherId) => {
    try {
      await updateClass(classForTeacherAssign.classId, { teacherId: teacherId || null });
      alert("Gán giáo viên thành công!");
      setOpenAssignTeacherModal(false);
      const updated = await getAllClasses();
      setClasses(updated);
    } catch (err) {
      alert("Gán giáo viên thất bại");
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Xóa lớp này? Tất cả học sinh sẽ bị bỏ lớp!")) return;
    try {
      await deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="text-4xl font-bold text-purple-800">QUẢN LÝ LỚP HỌC</h1>
        <button className="btn-purple px-6 py-3 text-lg" onClick={openAdd}>
          + Thêm lớp mới
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xl">Đang tải dữ liệu...</p>
      ) : (
        <>
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
                  <td className="fw-bold text-purple-700">{cls.classId}</td>
                  <td className="fw-semibold">{cls.className}</td>
                  <td>{cls.description || "-"}</td>
                  <td>
                    {cls.teacherId ? (
                      <span className="text-success fw-bold">
                        {cls.teacherId.fullName}
                      </span>
                    ) : (
                      <span className="text-muted fst-italic">Chưa có</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary fs-5 px-3 py-2">
                      {cls.studentCount || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-info btn-sm me-2" onClick={() => openViewMembers(cls)}>
                      Xem thành viên
                    </button>
                    <button className="btn btn-success btn-sm me-2" onClick={() => openAssignStudent(cls)}>
                      Gán HS
                    </button>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openAssignTeacher(cls)}>
                      Gán GV
                    </button>
                    <button className="btn btn-secondary btn-sm me-2" onClick={() => openEdit(cls)}>
                      Sửa
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls.classId)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-center mt-5">
            <MyPagination
              data={classes}
              itemsPerPage={itemsPerPage}
              onPageDataChange={setPageData}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Modal thêm/sửa lớp - có chọn giáo viên */}
      {openAddEditModal && (
        <ClassModal
          onClose={() => setOpenAddEditModal(false)}
          onSubmit={handleSaveClass}
          initialData={editingClass}
          teachers={teachers}
        />
      )}

      {/* Modal gán học sinh */}
      {openAssignStudentModal && (
        <AssignStudentModal
          classData={selectedClassForAssign}
          students={students}
          onAssign={handleAssignStudent}
          onClose={() => setOpenAssignStudentModal(false)}
        />
      )}

      {/* Modal gán giáo viên */}
      {openAssignTeacherModal && (
        <AssignTeacherModal
          classData={classForTeacherAssign}
          teachers={teachers}
          onAssign={handleAssignTeacher}
          onClose={() => setOpenAssignTeacherModal(false)}
        />
      )}

      {/* Modal xem thành viên + xóa học sinh */}
      {openViewMembersModal && (
        <ViewClassMembersModal
          classData={selectedClassForView}
          onClose={() => setOpenViewMembersModal(false)}
          onRemoveStudent={async (userId) => {
            try {
              await removeStudentFromClass(userId);
              const updated = await getAllClasses();
              setClasses(updated);
              alert("Xóa học sinh khỏi lớp thành công!");
            } catch (err) {
              alert("Xóa thất bại");
            }
          }}
        />
      )}
    </div>
  );
}

/* Modal thêm/sửa lớp - có chọn giáo viên */
function ClassModal({ onClose, onSubmit, initialData, teachers = [] }) {
  const [form, setForm] = useState({
    className: initialData?.className || "",
    description: initialData?.description || "",
    teacherId: initialData?.teacherId?._id || "",
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
      teacherId: form.teacherId || null,
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? "Cập nhật lớp học" : "Thêm lớp học mới"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
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
                <div className="mb-3">
                  <label className="form-label fw-bold">Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Giáo viên chủ nhiệm</label>
                  <select name="teacherId" value={form.teacherId} onChange={handleChange} className="form-select">
                    <option value="">-- Không có giáo viên --</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
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

/* Modal gán học sinh */
function AssignStudentModal({ classData, students, onAssign, onClose }) {
  const [selected, setSelected] = useState("");

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5>Gán học sinh vào lớp: <strong>{classData?.className}</strong></h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">-- Chọn học sinh --</option>
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.fullName} ({s.email}) {s.classId ? "(Đã có lớp)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
              <button className="btn btn-success" disabled={!selected} onClick={() => onAssign(selected)}>
                Gán
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Modal gán giáo viên */
function AssignTeacherModal({ classData, teachers, onAssign, onClose }) {
  const [selected, setSelected] = useState(classData?.teacherId?._id || "");

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5>Gán giáo viên cho lớp: <strong>{classData?.className}</strong></h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">-- Không có giáo viên --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({t.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
              <button className="btn btn-primary" onClick={() => onAssign(selected)}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Modal xem thành viên + XÓA HỌC SINH */
function ViewClassMembersModal({ classData, onClose, onRemoveStudent }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getStudentsInClass(classData.classId);
        setMembers(res.students || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải thành viên lớp");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [classData]);

  const handleRemove = async (student) => {
    if (!window.confirm(`Xóa ${student.fullName} khỏi lớp ${classData.className}?`)) return;
    try {
      await removeStudentFromClass(student.userId || student._id);
      setMembers((prev) => prev.filter((m) => (m.userId || m._id) !== (student.userId || student._id)));
      onRemoveStudent?.(student.userId || student._id); // Cập nhật sĩ số
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content shadow">
            <div className="modal-header bg-gradient-purple text-white">
              <h5 className="modal-title">
                Thành viên lớp: <strong>{classData?.className}</strong> ({members.length} học sinh)
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body p-5">
              {loading ? (
                <p className="text-center">Đang tải...</p>
              ) : members.length === 0 ? (
                <p className="text-center text-muted">Lớp chưa có học sinh</p>
              ) : (
                <div className="row g-4">
                  {members.map((student) => (
                    <div key={student._id} className="col-md-4 col-lg-3">
                      <div className="text-center member-card position-relative">
                        <img
                          src={student.avatarUrl || "https://i.pravatar.cc/150"}
                          alt={student.fullName}
                          className="member-avatar"
                        />
                        <h6 className="mt-3 mb-1 fw-bold">{student.fullName}</h6>
                        <p className="text-muted small">{student.email}</p>
                        <button
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                          style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
                          onClick={() => handleRemove(student)}
                          title="Xóa khỏi lớp"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}