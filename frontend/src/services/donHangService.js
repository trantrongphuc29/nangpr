/* ===== 🧾 BÁN HÀNG - ĐƠN HÀNG - FRONTEND SERVICE =====
 * API calls cho Đơn hàng POS (mở đơn, thêm món, thanh toán...)
 * Endpoint: /api/pos
 * =================================================== */
import axiosClient from "./axiosClient";

/** Mở đơn hàng cho bàn (tạo mới hoặc lấy đơn đang phục vụ) */
export const openOrder = async ({ ma_ban, loai_don = 'tai_cho' }) => {
  const response = await axiosClient.post("/api/pos/open", { ma_ban, loai_don });
  return response.data;
};

/** Lấy chi tiết đơn hàng */
export const getOrder = async (id) => {
  const response = await axiosClient.get(`/api/pos/${id}`);
  return response.data;
};

/** Thêm món vào đơn */
export const addItem = async (orderId, { ma_mon, so_luong = 1, ghi_chu_mon }) => {
  const response = await axiosClient.post(`/api/pos/${orderId}/items`, {
    ma_mon,
    so_luong,
    ghi_chu_mon,
  });
  return response.data;
};

/** Cập nhật số lượng món (gửi 0 để xóa) */
export const updateItemQty = async (orderId, ma_mon, so_luong) => {
  const response = await axiosClient.put(`/api/pos/${orderId}/items/${ma_mon}`, {
    so_luong,
  });
  return response.data;
};

/** Cập nhật ghi chú món */
export const updateItemNote = async (orderId, ma_mon, ghi_chu_mon) => {
  const response = await axiosClient.put(`/api/pos/${orderId}/items/${ma_mon}/note`, { ghi_chu_mon });
  return response.data;
};

/** Gửi món xuống bar */
export const sendToBar = async (orderId) => {
  const response = await axiosClient.post(`/api/pos/${orderId}/gui-bar`);
  return response.data;
};

/** Thanh toán đơn */
export const checkout = async (orderId, hinh_thuc_thanh_toan) => {
  const response = await axiosClient.post(`/api/pos/${orderId}/checkout`, { hinh_thuc_thanh_toan });
  return response.data;
};

/** Hủy đơn */
export const cancelOrder = async (orderId) => {
  const response = await axiosClient.post(`/api/pos/${orderId}/cancel`);
  return response.data;
};

/** Chuyển đơn sang bàn khác */
export const moveOrderToBan = async (orderId, ma_ban_moi) => {
  const response = await axiosClient.post(`/api/pos/${orderId}/move-ban`, { ma_ban_moi });
  return response.data;
};

/** Cập nhật phí giao hàng */
export const updatePhiGiaoHang = async (orderId, phi_giao_hang) => {
  const response = await axiosClient.put(`/api/pos/${orderId}/phi-giao-hang`, { phi_giao_hang });
  return response.data;
};

/** Cập nhật thông tin giao hàng (SĐT, địa chỉ) */
export const updateDeliveryInfo = async (orderId, data) => {
  const response = await axiosClient.put(`/api/pos/${orderId}/delivery-info`, data);
  return response.data;
};

/** Lấy lịch sử huỷ món của một đơn */
export const getCancelHistory = async (orderId) => {
  const response = await axiosClient.get(`/api/pos/${orderId}/cancel-history`);
  return response.data;
};

/** Lấy tất cả lịch sử huỷ */
export const getAllCancelHistory = async (limit = 50, offset = 0) => {
  const response = await axiosClient.get(`/api/pos/cancel-history?limit=${limit}&offset=${offset}`);
  return response.data;
};

/** Lấy danh sách đơn đã hoàn thành */
export const getCompletedOrders = async (limit = 50, offset = 0) => {
  const response = await axiosClient.get(`/api/pos/completed-orders?limit=${limit}&offset=${offset}`);
  return response.data;
};

/** Lấy báo cáo doanh thu với bộ lọc + phân trang */
export const getRevenueReport = async ({ period = 'day', date, from_date, to_date, loai_don, hinh_thuc_thanh_toan, limit = 20, offset = 0 }) => {
  const params = new URLSearchParams({ period, limit, offset });
  if (date) params.append('date', date);
  if (from_date) params.append('from_date', from_date);
  if (to_date) params.append('to_date', to_date);
  if (loai_don) params.append('loai_don', loai_don);
  if (hinh_thuc_thanh_toan) params.append('hinh_thuc_thanh_toan', hinh_thuc_thanh_toan);
  const response = await axiosClient.get(`/api/pos/revenue?${params}`);
  return response.data;
};
