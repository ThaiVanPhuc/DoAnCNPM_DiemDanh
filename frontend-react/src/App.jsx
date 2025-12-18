import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FaceTrainingApp from "./FaceTrainingApp";
import FaceAttendanceApp from "./FaceAttendanceApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/training" element={<FaceTrainingApp />} />
      <Route path="/attendance" element={<FaceAttendanceApp />} />
    </Routes>
  );
}

export default App;
