import { useState } from "react";
import { useUsers } from "../hooks/useUser";
import FormModal from "./FormModal";
import MyPagination from "./Pagination";
import "../assets/styles/UserTable.css";

export default function FormTable() {
  const { users, loading, error, addUser, updateUserById, deleteUserById } = useUsers();

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openAdd = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateUserById(editingUser.userId, formData);
      } else {
        await addUser(formData);
      }
      setOpenModal(false);
    } catch (err) {
      alert("Lỗi khi lưu người dùng");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      await deleteUserById(id);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý người dùng</h2>
        <button className="btn btn-purple px-4" onClick={openAdd}>
          + Thêm người dùng
        </button>
      </div>

      {loading && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      <table className="table table-hover align-middle custom-table">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Avatar</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((u, index) => (
            <tr key={u.userId}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>
                {u.avatarUrl && (
                  <img src={u.avatarUrl} alt="avatar" className="rounded-circle user-avatar" />
                )}
              </td>
              <td className="fw-semibold">{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.phone || "-"}</td>
              <td>{u.address || "-"}</td>
              <td>{u.birthday ? new Date(u.birthday).toLocaleDateString() : "-"}</td>
              <td>{u.gender === "male" ? "Nam" : "Nữ"}</td>
              <td>
                <span
                  className={`badge ${
                    u.role === "STUDENT"
                      ? "badge-student"
                      : u.role === "TEACHER"
                      ? "badge-teacher"
                      : "badge-admin"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(u)}>
                  Sửa
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.userId)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <MyPagination
          data={users}
          itemsPerPage={itemsPerPage}
          onPageDataChange={setPageData}
          onPageChange={setCurrentPage}
        />
      </div>

      {openModal && (
        <FormModal
          onClose={() => setOpenModal(false)}
          onSubmit={handleSubmit}
          initialData={editingUser}
        />
      )}
    </div>
  );
}