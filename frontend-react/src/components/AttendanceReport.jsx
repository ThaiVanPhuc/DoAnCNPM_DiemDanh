import { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import {
  getAttendanceStatistics,
  exportAttendancePDF,
  exportAttendanceExcel,
} from "../services/attendanceService"; // Sẽ tạo ở bước 2
import { getAllClasses } from "../services/classService";
import "../assets/styles/UserTable.css";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    presentRate: 0,
    lateRate: 0,
    absentRate: 0,
  });
  const [dailyStats, setDailyStats] = useState([]); // Dùng cho Bar Chart
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    classId: "",
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0], // 1 tháng trước
    endDate: new Date().toISOString().split("T")[0],
  });

  // Load danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        setClasses(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  // Load thống kê khi filter thay đổi
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const params = {
          classId: filters.classId || undefined,
          startDate: filters.startDate,
          endDate: filters.endDate,
        };

        const [totalRes, dailyRes] = await Promise.all([
          getAttendanceStatistics(params),
          getAttendanceReport(params), // Nếu backend có API report theo ngày
        ]);

        setStats(totalRes || {
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          presentRate: 0,
          lateRate: 0,
          absentRate: 0,
        });

        // Giả sử dailyRes trả về mảng theo ngày
        setDailyStats(dailyRes || []);
      } catch (err) {
        alert("Lỗi tải báo cáo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (type) => {
    try {
      const params = {
        classId: filters.classId || undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const res = type === "pdf" ? await exportAttendancePDF(params) : await exportAttendanceExcel(params);

      const blob = new Blob([res.data], {
        type: type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bao-cao-diem-danh-${filters.startDate}-den-${filters.endDate}.${type}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Xuất file thất bại");
    }
  };

  // Biểu đồ tròn
  const pieData = {
    labels: ["Có mặt", "Đi muộn", "Vắng"],
    datasets: [
      {
        data: [stats.present, stats.late, stats.absent],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ cột theo ngày (giả sử dailyStats có cấu trúc { date: "2025-12-01", present: 20, late: 3, absent: 2 })
  const barData = {
    labels: dailyStats.map(d => d.date ? new Date(d.date).toLocaleDateString("vi-VN") : "N/A"),
    datasets: [
      {
        label: "Có mặt",
        data: dailyStats.map(d => d.present || 0),
        backgroundColor: "#10b981",
      },
      {
        label: "Đi muộn",
        data: dailyStats.map(d => d.late || 0),
        backgroundColor: "#f59e0b",
      },
      {
        label: "Vắng",
        data: dailyStats.map(d => d.absent || 0),
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Báo Cáo Điểm Danh</h2>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded shadow mb-5">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold">Lớp học</label>
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Tất cả lớp</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label d-block">&nbsp;</label>
            <div className="d-flex gap-2">
              <button className="btn btn-danger flex-fill" onClick={() => handleExport("pdf")}>
                Xuất PDF
              </button>
              <button className="btn btn-success flex-fill" onClick={() => handleExport("excel")}>
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Đang tải báo cáo...</p>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="row mb-5">
            <div className="col-lg-4">
              <div className="card shadow text-center p-4">
                <h4>Tổng buổi</h4>
                <h2 className="text-primary">{stats.total || 0}</h2>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow text-center p-4">
                <h4>Chuyên cần</h4>
                <h2 className="text-success">{stats.presentRate}%</h2>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow text-center p-4">
                <h4>Vắng mặt</h4>
                <h2 className="text-danger">{stats.absentRate}%</h2>
              </div>
            </div>
          </div>

          {/* Biểu đồ */}
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card shadow p-4">
                <h4 className="text-center mb-4">Tỷ lệ điểm danh</h4>
                <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card shadow p-4">
                <h4 className="text-center mb-4">Thống kê theo ngày</h4>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}