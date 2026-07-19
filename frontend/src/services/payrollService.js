import axiosClient from "./axiosClient";

export const getBangCong = async ({ thang, nam, ma_nhan_vien } = {}) => {
  const params = new URLSearchParams();
  params.append("thang", thang);
  params.append("nam", nam);
  if (ma_nhan_vien) params.append("ma_nhan_vien", ma_nhan_vien);

  const response = await axiosClient.get(`/api/payroll/bang-cong?${params.toString()}`);
  return response.data;
};

export const getBangCongChiTiet = async ({ thang, nam, ma_nhan_vien }) => {
  const params = new URLSearchParams();
  params.append("thang", thang);
  params.append("nam", nam);
  params.append("ma_nhan_vien", ma_nhan_vien);
  const response = await axiosClient.get(`/api/payroll/bang-cong/chi-tiet?${params.toString()}`);
  return response.data;
};

export const getBangLuong = async ({ thang, nam, ma_nhan_vien } = {}) => {
  const params = new URLSearchParams();
  params.append("thang", thang);
  params.append("nam", nam);
  if (ma_nhan_vien) params.append("ma_nhan_vien", ma_nhan_vien);

  const response = await axiosClient.get(`/api/payroll/bang-luong?${params.toString()}`);
  return response.data;
};

export const updateBangLuongEmployee = async ({ thang, nam, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung }) => {
  const response = await axiosClient.put("/api/payroll/bang-luong/nhan-vien", {
    thang,
    nam,
    ma_nhan_vien,
    phu_cap,
    thuong,
    khau_tru,
    tam_ung,
  });
  return response.data;
};

export const lockKyLuong = async ({ thang, nam }) => {
  const response = await axiosClient.post("/api/payroll/ky-luong/chot", { thang, nam });
  return response.data;
};

export const unlockKyLuong = async ({ thang, nam }) => {
  const response = await axiosClient.post("/api/payroll/ky-luong/mo-chot", { thang, nam });
  return response.data;
};

export const markKyLuongPaid = async ({ thang, nam }) => {
  const response = await axiosClient.post("/api/payroll/ky-luong/danh-dau-da-thanh-toan", { thang, nam });
  return response.data;
};

export const revertKyLuongPaid = async ({ thang, nam, mat_khau }) => {
  const response = await axiosClient.post("/api/payroll/ky-luong/hoan-tac-thanh-toan", { thang, nam, mat_khau });
  return response.data;
};

export const getLuongNhanVien = async () => {
  const response = await axiosClient.get("/api/payroll/luong-nhan-vien");
  return response.data;
};

export const upsertLuongNhanVienBulk = async ({ items }) => {
  const response = await axiosClient.put("/api/payroll/luong-nhan-vien/bulk", { items });
  return response.data;
};

// ===== Ngày lễ / hệ số lương =====
export const getNgayLe = async () => {
  const response = await axiosClient.get("/api/payroll/ngay-le");
  return Array.isArray(response.data) ? response.data : [];
};

export const upsertNgayLe = async ({ ngay, ten, he_so }) => {
  const response = await axiosClient.post("/api/payroll/ngay-le", { ngay, ten, he_so });
  return response.data;
};

export const deleteNgayLe = async (ngay) => {
  const response = await axiosClient.delete(`/api/payroll/ngay-le/${ngay}`);
  return response.data;
};

