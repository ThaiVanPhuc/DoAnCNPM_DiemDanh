import { useEffect, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user từ localStorage khi app bắt đầu
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setUserId(parsed.userId);
    }
  }, []);

  useEffect(() => {
    if (userId !== null) {
      console.log("Current userId:", userId);
    }
  }, [userId]);

  const login = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      setUserId(data.user.userId);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(userData);
      return data;
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return { user, setUser, userId, loading, error, login, register, logout };
};
