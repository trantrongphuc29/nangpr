import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // 1. Chỉ tìm chìa khóa là "token", không tìm "user" nữa
  const token = localStorage.getItem("token");

  // 2. Nếu không có token -> Đuổi về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Có token -> Mở cửa cho vào Layout / Dashboard
  return children;
}