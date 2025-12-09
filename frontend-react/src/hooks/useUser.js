import { useState, useEffect } from "react";
import * as userService from "../services/userService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy tất cả user
  const fetchUsers = async () => {
    
    setLoading(true);
    setError("");
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Thêm user
  const addUser = async (userData) => {
    try {
      const newUser = await userService.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message || "Thêm user thất bại");
      throw err;
    }
  };

  // Cập nhật user
  const updateUserById = async (id, userData) => {
    try {
      const updatedUser = await userService.updateUser(id, userData);
      setUsers((prev) =>
        prev.map((u) => (u.userId === id ? updatedUser : u))
      );
      return updatedUser;
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
      throw err;
    }
  };

  // Xóa user
  const deleteUserById = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.userId !== id));
    } catch (err) {
      setError(err.message || "Xóa thất bại");
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUserById,
    deleteUserById,
  };
};
