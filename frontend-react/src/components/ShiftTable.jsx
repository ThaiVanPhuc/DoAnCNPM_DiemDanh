import { useEffect, useState } from "react";
import MyPagination from "./Pagination";
import {
  getAllShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../services/shiftService";

export default function ShiftTable() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await getAllShifts();
      setShifts(res);
    } catch {
      alert("Lỗi tải ca học");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingShift(null);
    setOpenModal(true);
  };

  const openEdit = (shift) => {
    setEditingShift(shift);
    setOpenModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingShift) {
        await updateShift(editingShift._id, data);
      } else {
        await createShift(data);
      }
      setOpenModal(false);
      fetchShifts();
    } catch {
      alert("Lỗi lưu ca học");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa ca học này?")) return;
    try {
      await deleteShift(id);
      setShifts((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="text-4xl font-bold text-purple-800">QUẢN LÝ CA HỌC</h1>
        <button className="btn-purple px-6 py-3 text-lg" onClick={openAdd}>
          + Thêm ca học
        </button>
      </div>

      {loading ? (
        <p className="text-center">Đang tải...</p>
      ) : (
        <>
          <table className="table table-hover align-middle custom-table">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Tên ca</th>
                <th>Thứ</th>
                <th>Giờ bắt đầu</th>
                <th>Giờ kết thúc</th>
                <th>Lớp</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((shift, index) => (
                <tr key={shift._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="fw-bold text-purple-700">{shift.name}</td>
                  <td>Thứ {shift.dayOfWeek}</td>
                  <td>{shift.startTime}</td>
                  <td>{shift.endTime}</td>
                  <td>{shift.className || "-"}</td>
                  <td>{shift.description || "-"}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => openEdit(shift)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(shift._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-center mt-5">
            <MyPagination
              data={shifts}
              itemsPerPage={itemsPerPage}
              onPageDataChange={setPageData}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {openModal && (
        <ShiftModal
          onClose={() => setOpenModal(false)}
          onSubmit={handleSave}
          initialData={editingShift}
        />
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function ShiftModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    dayOfWeek: initialData?.dayOfWeek || 2,
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    className: initialData?.className || "",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? "Cập nhật ca học" : "Thêm ca học"}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên ca *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Thứ</label>
                  <select
                    name="dayOfWeek"
                    value={form.dayOfWeek}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {[2, 3, 4, 5, 6, 7, 1].map((d) => (
                      <option key={d} value={d}>
                        Thứ {d === 1 ? "CN" : d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col">
                    <label className="form-label fw-bold">Giờ bắt đầu</label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col">
                    <label className="form-label fw-bold">Giờ kết thúc</label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-bold">Lớp học</label>
                  <input
                    name="className"
                    value={form.className}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="VD: CNTT22A, 10A1"
                  />
                </div>

                <div className="mt-3">
                  <label className="form-label fw-bold">Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={onClose}>
                    Hủy
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Lưu
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
