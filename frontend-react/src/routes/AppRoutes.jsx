import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PrivateRoute from "./PrivateRoute";
import AdminDashboard from "../pages/AdminDashboard";
import MyProfilePage from "../pages/MyProfilePage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private */}
      <Route
        path="/profile/user"
        element={
          <PrivateRoute>
            <MyProfilePage />
          </PrivateRoute>
        }
      />
{/* Face Recognition - BẮT BUỘC LOGIN */}
      <Route
        path="/training"
        element={
          <PrivateRoute>
            <FaceTrainingApp />
          </PrivateRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <FaceAttendanceApp />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Không khớp route nào → quay về Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
