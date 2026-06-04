import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ban from "./pages/Ban";
import NhanVien from "./pages/NhanVien";
import NguyenLieu from "./pages/NguyenLieu";
import MonCongThuc from './pages/MonCongThuc'; // Đã xử lý sử dụng chuẩn xác dứt điểm lỗi no-unused-vars
import BangCong from "./pages/BangCong";
import BangLuong from "./pages/BangLuong";
import CauHinhLuongNhanVien from "./pages/CauHinhLuongNhanVien";
import { ThemeProvider } from "./context/ThemeContext"; 

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
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
            <Route path="nguyenlieu" element={<NguyenLieu />} />
            <Route path="bangcong" element={<BangCong />} />
            <Route path="bangluong" element={<BangLuong />} />
            <Route path="luongnhanvien" element={<CauHinhLuongNhanVien />} />
            {/* ĐÃ FIX: Chuyển /menu thành menu để chạy ăn khớp 100% với hệ thống định tuyến con của Layout */}
            <Route path="menu" element={<MonCongThuc />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;