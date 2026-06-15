/* ===== 🍽️ MÓN & CÔNG THỨC - FRONTEND SERVICE =====
 * API calls cho module Món & Công thức, POS Menu
 * Endpoint: /api/mon
 * ================================================ */
import axiosClient from './axiosClient';

export const getDanhSachMon = async () => {
  const response = await axiosClient.get('/api/mon');
  return response.data;
};

export const getDanhMucMenu = async () => {
  const response = await axiosClient.get('/api/mon/categories');
  return response.data;
};

export const createMonMoi = async (payload) => {
  const response = await axiosClient.post('/api/mon', payload);
  return response.data;
};

export const updateMonCu = async (id, payload) => {
  const response = await axiosClient.put(`/api/mon/${id}`, payload);
  return response.data;
};

export const deleteMonCu = async (id) => {
  const response = await axiosClient.delete(`/api/mon/${id}`);
  return response.data;
};

/** POS: lấy thực đơn kèm ước lượng tồn kho */
export const getMenuPos = async () => {
  const response = await axiosClient.get("/api/mon/pos");
  return response.data;
};