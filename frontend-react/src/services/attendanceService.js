import API from "./api";

// Thống kê tổng
export const getAttendanceStatistics = async (params = {}) => {
  const res = await API.get("/api/attendance/statistics", { params });
  return res.data;
};

// Báo cáo theo ngày (nếu backend có)
export const getAttendanceReport = async (params = {}) => {
  const res = await API.get("/api/attendance/report", { params });
  return res.data;
};

// Xuất PDF
export const exportAttendancePDF = async (params = {}) => {
  const res = await API.get("/api/attendance/export/pdf", {
    params,
    responseType: "blob",
  });
  return res;
};

// Xuất Excel
export const exportAttendanceExcel = async (params = {}) => {
  const res = await API.get("/api/attendance/export/excel", {
    params,
    responseType: "blob",
  });
  return res;
};