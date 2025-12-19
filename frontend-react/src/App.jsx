import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/MyProfilePage";

// Apps / Features
import FaceTrainingApp from "./FaceTrainingApp";
import FaceAttendanceApp from "./FaceAttendanceApp";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Profile */}
      <Route path="/profile/user" element={<UserProfilePage />} />

      {/* Face Recognition */}
      <Route path="/training" element={<FaceTrainingApp />} />
      <Route path="/attendance" element={<FaceAttendanceApp />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h1>404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
