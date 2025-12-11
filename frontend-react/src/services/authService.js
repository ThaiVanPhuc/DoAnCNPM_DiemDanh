import API from "./api";

// Đăng ký
export const registerUser = async (userData) => {
  try {
    const res = await API.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};

// Đăng nhập
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};
// Dang xuat 
export const logoutUser = () => {
  localStorage.removeItem("token");
};