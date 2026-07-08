/* ===== 💰 CÔNG NỢ - FRONTEND SERVICE =====
 * API calls cho module Công nợ
 * Endpoint: /api/congno
 * ========================================= */
import axiosClient from "./axiosClient";

/** Lấy danh sách công nợ */
export const getCongNo = async ({ trang_thai, nha_cung_cap, search, from_date, to_date, limit, offset } = {}) => {
  const params = new URLSearchParams();
  if (trang_thai) params.append("trang_thai", trang_thai);
  if (nha_cung_cap) params.append("nha_cung_cap", nha_cung_cap);
  if (search) params.append("search", search);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);
  const response = await axiosClient.get(`/api/congno?${params}`);
  return response.data;
};

/** Lấy thống kê công nợ */
export const getCongNoStats = async ({ from_date, to_date } = {}) => {
  const params = new URLSearchParams();
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  const url = `/api/congno/stats${params.toString() ? `?${params}` : ''}`;
  const response = await axiosClient.get(url);
  return response.data;
};

/** Thanh toán công nợ */
export const payCongNo = async (id, so_tien) => {
  const response = await axiosClient.put(`/api/congno/${id}/pay`, { so_tien });
  return response.data;
};

/** Thanh toán tất cả công nợ đang nợ */
export const payAllCongNo = async () => {
  const response = await axiosClient.post('/api/congno/pay-all');
  return response.data;
};

/** Lấy lịch sử thanh toán công nợ */
export const getPaymentHistory = async ({ from_date, to_date, search, limit, offset } = {}) => {
  const params = new URLSearchParams();
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  if (search) params.append("search", search);
  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);
  const url = `/api/congno/payments${params.toString() ? `?${params}` : ''}`;
  const response = await axiosClient.get(url);
  return response.data;
};
