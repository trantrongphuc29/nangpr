import axiosClient from "./axiosClient";

export const getBanList = async (sort = "asc") => {
  const response = await axiosClient.get(`/api/ban?sort=${sort}`);
  return response.data;
};

export const createBan = async (payload) => {
  const response = await axiosClient.post("/api/ban", payload);
  return response.data;
};

export const updateBanById = async (id, payload) => {
  const response = await axiosClient.put(`/api/ban/${id}`, payload);
  return response.data;
};

export const deleteBanById = async (id) => {
  const response = await axiosClient.delete(`/api/ban/${id}`);
  return response.data;
};
