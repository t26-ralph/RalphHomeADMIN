import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) return <Navigate to="/login" />;

    // Kiểm tra role nếu có yêu cầu
    if (role && user.role !== role) return <Navigate to="/login" />;

    return children;
}

export default ProtectedRoute;
