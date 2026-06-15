/* ===== 🍽️ CÔNG THỨC MÓN - FRONTEND SERVICE =====
 * API calls riêng cho Công thức (tách biệt với monService)
 * Endpoint: /api/mon/:id/cong-thuc
 * =============================================== */
import axiosClient from "./axiosClient";

/** Lấy danh sách công thức của một món */
export const getCongThuc = async (maMon) => {
  const response = await axiosClient.get(`/api/mon/${maMon}/cong-thuc`);
  return response.data;
};

/** Ghi đè toàn bộ công thức cho một món */
export const saveCongThuc = async (maMon, congThuc) => {
  const response = await axiosClient.put(`/api/mon/${maMon}/cong-thuc`, { cong_thuc: congThuc });
  return response.data;
};
