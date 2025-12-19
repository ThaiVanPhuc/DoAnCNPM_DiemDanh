import { Navigate } from "react-router-dom";

function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (
    roleRequired &&
    user?.role !== roleRequired &&
    user?.role !== "ADMIN"
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
