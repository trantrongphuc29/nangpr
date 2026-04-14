import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Ban from "./pages/Ban";
import Login from "./pages/Login";
import NhanVien from "./pages/NhanVien";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Các trang yêu cầu đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="ban" element={<Ban />} />
          <Route path="nhanvien" element={<NhanVien />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;