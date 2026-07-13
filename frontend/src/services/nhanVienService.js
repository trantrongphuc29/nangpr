import axiosClient from "./axiosClient";

export const getNhanVienList = async () => {
  const response = await axiosClient.get("/api/nhanvien");
  return response.data;
};

export const getLichPhanCong = async ({ startDate, endDate }) => {
  const response = await axiosClient.get(
    `/api/nhanvien/lich-phan-cong?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

export const createNhanVien = async (payload) => {
  const response = await axiosClient.post("/api/nhanvien", payload);
  return response.data;
};

export const updateNhanVien = async (id, payload) => {
  const response = await axiosClient.put(`/api/nhanvien/${id}`, payload);
  return response.data;
};

export const deleteNhanVien = async (id) => {
  const response = await axiosClient.delete(`/api/nhanvien/${id}`);
  return response.data;
};

export const createPhanCong = async (payload) => {
  const response = await axiosClient.post("/api/nhanvien/phan-cong", payload);
  return response.data;
};

export const deletePhanCong = async (payload) => {
  const response = await axiosClient.delete("/api/nhanvien/phan-cong", {
    data: payload,
  });
  return response.data;
};
// Thêm hàm này vào file nhanVienService.js của bạn
export const updateNhanVienStatus = async (id, trang_thai) => {
  const response = await axiosClient.patch(`/api/nhanvien/${id}/status`, { trang_thai });
  return response.data;
};

// ── Ca linh hoạt (giờ tùy chỉnh) ──
export const getLichPhanCongLinhHoat = async ({ startDate, endDate }) => {
  const response = await axiosClient.get(
    `/api/nhanvien/lich-phan-cong-linh-hoat?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

export const createPhanCongLinhHoat = async (payload) => {
  const response = await axiosClient.post("/api/nhanvien/phan-cong-linh-hoat", payload);
  return response.data;
};

export const updatePhanCongLinhHoat = async (id, payload) => {
  const response = await axiosClient.put(`/api/nhanvien/phan-cong-linh-hoat/${id}`, payload);
  return response.data;
};

export const deletePhanCongLinhHoat = async (id) => {
  const response = await axiosClient.delete(`/api/nhanvien/phan-cong-linh-hoat/${id}`);
  return response.data;
};