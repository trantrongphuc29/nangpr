import axiosClient from './axiosClient';

// ĐỒNG BỘ CHÍNH XÁC TIỀN TỐ /API THEO ROUTE BACKEND
export const getDanhSachMon = async () => {
  const response = await axiosClient.get('/api/mon'); //  Sửa từ '/mon' thành '/api/mon'
  return response.data;
};

export const getDanhMucMenu = async () => {
  const response = await axiosClient.get('/api/mon/categories'); //  Sửa từ '/mon/categories' thành '/api/mon/categories'
  return response.data;
};

export const createMonMoi = async (payload) => {
  const response = await axiosClient.post('/api/mon', payload); //  Sửa thành '/api/mon'
  return response.data;
};

export const updateMonCu = async (id, payload) => {
  const response = await axiosClient.put(`/api/mon/${id}`, payload); //  Sửa thành `/api/mon/${id}`
  return response.data;
};

export const deleteMonCu = async (id) => {
  const response = await axiosClient.delete(`/api/mon/${id}`); //  Sửa thành `/api/mon/${id}`
  return response.data;
};