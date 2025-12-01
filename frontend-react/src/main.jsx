import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FaceTrainingApp from "./FaceTrainingApp";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FaceTrainingApp />
  </StrictMode>
);
