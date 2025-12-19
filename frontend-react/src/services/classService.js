// src/services/classService.js
import API from "./api";

// Lấy tất cả lớp học (có populate teacher)
export const getAllClasses = async () => {
  const res = await API.get("/api/classes");
  return res.data;
};

// Tạo lớp mới
export const createClass = async (classData) => {
  const res = await API.post("/api/classes", classData);
  return res.data;
};

// Cập nhật lớp
export const updateClass = async (classId, classData) => {
  const res = await API.put(`/api/classes/${classId}`, classData);
  return res.data;
};

// Xóa lớp
export const deleteClass = async (classId) => {
  const res = await API.delete(`/api/classes/${classId}`);
  return res.data;
};

// Gán học sinh vào lớp
export const assignStudentToClass = async (assignData) => {
  const res = await API.post("/api/classes/assign", assignData);
  return res.data;
};

// Xem danh sách học sinh trong lớp
export const getStudentsInClass = async (classId) => {
  const res = await API.get(`/api/classes/${classId}/students`);
  return res.data;
};

// XÓA HỌC SINH KHỎI LỚP (set classId = null cho user)
export const removeStudentFromClass = async (userId) => {
  // Backend sẽ xử lý set classId = null
  const res = await API.put(`/api/users/${userId}`, { classId: null });
  return res.data;
};