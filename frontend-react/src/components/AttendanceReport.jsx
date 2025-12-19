import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllClasses } from "../services/classService";
import {
  getAttendanceStatistics,
  exportAttendancePDF,
  exportAttendanceExcel,
} from "../services/attendanceService";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    presentRate: 0,
    lateRate: 0,
    absentRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    classId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    getAllClasses()
      .then((res) => setClasses(res))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!filters.classId && !filters.startDate && !filters.endDate) return;
      setLoading(true);
      try {
        const res = await getAttendanceStatistics(filters);
        setStats(res);
      } catch  {
        alert("Lỗi tải thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = async (type) => {
    try {
      const res = type === "pdf" ? await exportAttendancePDF(filters) : await exportAttendanceExcel(filters);
      const blob = new Blob([res.data], {
        type: type === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-diem-danh.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Xuất file thất bại");
    }
  };

  const pieData = {
    labels: ["Có mặt", "Đi muộn", "Vắng"],
    datasets: [
      {
        data: [stats.presentRate || 0, stats.lateRate || 0, stats.absentRate || 0],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  return (
    <div className="container py-4">
      <h2 className="text-3xl font-bold mb-6">Báo Cáo Điểm Danh</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="border rounded p-2" value={filters.classId} onChange={handleFilterChange}>
            <option value="">Tất cả lớp</option>
            {classes.map((c) => (
              <option key={c._id} value={c.classId}>
                {c.className}
              </option>
            ))}
          </select>
          <input type="date" className="border rounded p-2" value={filters.startDate} onChange={handleFilterChange} name="startDate" />
          <input type="date" className="border rounded p-2" value={filters.endDate} onChange={handleFilterChange} name="endDate" />
          <div className="flex gap-2">
            <button onClick={() => handleExport("pdf")} className="bg-red-500 text-white px-4 py-2 rounded">
              PDF
            </button>
            <button onClick={() => handleExport("excel")} className="bg-green-500 text-white px-4 py-2 rounded">
              Excel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-center">Tỷ lệ chuyên cần</h3>
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Thống kê chi tiết</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span>Có mặt:</span> <strong className="text-green-600">{stats.presentRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Đi muộn:</span> <strong className="text-yellow-600">{stats.lateRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Vắng:</span> <strong className="text-red-600">{stats.absentRate}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}