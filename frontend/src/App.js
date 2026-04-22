import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ban from "./pages/Ban";
import NhanVien from "./pages/NhanVien";

function App() {
  return (
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;