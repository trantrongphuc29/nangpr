/* ===== 🥬 NGUYÊN LIỆU - FRONTEND SERVICE =====
 * API calls cho module Nguyên liệu
 * Endpoint: /api/nguyenlieu
 * ============================================= */
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/nguyenlieu';

export const getNguyenLieu = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getDanhMucNguyenLieu = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};

export const createNguyenLieu = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateNguyenLieu = async (id, data) => {
    const cleanId = parseInt(id, 10);
    const response = await axios.put(`${API_URL}/${cleanId}`, data);
    return response.data;
};

export const deleteNguyenLieu = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const importStock = async (payload) => {
    const response = await axios.post(`${API_URL}/import`, payload);
    return response.data;
};

export const getImportHistory = async () => {
    const response = await axios.get(`${API_URL}/history`);
    return response.data;
};

export const getCostStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};

export const setTrangThaiNguyenLieu = async (id, trang_thai) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { trang_thai });
    return response.data;
};