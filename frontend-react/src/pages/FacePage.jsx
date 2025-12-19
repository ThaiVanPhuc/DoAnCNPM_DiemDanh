import FaceTrainingApp from "./FaceTrainingApp";
import FaceAttendanceApp from "./FaceAttendanceApp";
import Header from "../layouts/header.jsx";

export default function FacePage() {
  return (
    <>
     <Header />
    <div style={{ padding: "10px" }}>
      <section style={{ marginBottom: "20px" }}>
         <FaceTrainingApp />
         <FaceAttendanceApp />
      </section>

      <hr />

      
    </div>
    </>
  );
}
