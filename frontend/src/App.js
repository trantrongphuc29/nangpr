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
import BanHang from "./pages/BanHang";
import BangLuong from "./pages/BangLuong";
import CauHinhLuongNhanVien from "./pages/CauHinhLuongNhanVien";
import DoanhThu from "./pages/DoanhThu";
import CongNo from "./pages/CongNo";

import { ThemeProvider } from "./context/ThemeContext"; 

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang mặc định: Form đăng nhập */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes - giữ nguyên đường dẫn (sidebar không bị ảnh hưởng) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ban" element={<Ban />} />
            <Route path="/nhanvien" element={<NhanVien />} />
            <Route path="/nguyenlieu" element={<NguyenLieu />} />
            <Route path="/bangcong" element={<BangCong />} />
            <Route path="/bangluong" element={<BangLuong />} />
            <Route path="/luongnhanvien" element={<CauHinhLuongNhanVien />} />
            <Route path="/menu" element={<MonCongThuc />} />
            <Route path="/pos" element={<BanHang />} />
            <Route path="/doanhthu" element={<DoanhThu />} />
            <Route path="/congno" element={<CongNo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;