import API from "./api";

// Lấy tất cả user
export const getAllUsers = async () => {
  const res = await API.get("/api/users");
  return res.data;
};

// Lấy user theo userId
export const getUserById = async (id) => {
  const res = await API.get(`/api/users/${id}`);
  return res.data;
};

// Tạo user mới
export const createUser = async (userData) => {
  const res = await API.post("/api/users", userData);
  return res.data;
};

// Cập nhật user
export const updateUser = async (id, userData) => {
  const res = await API.put(`/api/users/${id}`, userData);
  return res.data;
};

// Xóa user
export const deleteUser = async (id) => {
  const res = await API.delete(`/api/users/${id}`);
  return res.data;
};
