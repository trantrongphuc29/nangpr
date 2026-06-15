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

/** Xóa món khỏi đơn */
export const removeItem = async (orderId, ma_mon) => {
  const response = await axiosClient.delete(`/api/pos/${orderId}/items/${ma_mon}`);
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
