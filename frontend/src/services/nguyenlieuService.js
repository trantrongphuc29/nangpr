import axios from 'axios';

const API_URL = 'http://localhost:3000/api/nguyenlieu';

export const getNguyenLieu = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createNguyenLieu = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

// Đã fix sạch dấu lạ ':1' bằng parseInt ở tầng client
export const updateNguyenLieu = async (id, data) => {
    const cleanId = parseInt(id); 
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