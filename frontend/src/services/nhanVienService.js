import axiosClient from "./axiosClient";

export const getNhanVienList = async () => {
  const response = await axiosClient.get("/api/nhanvien");
  return response.data;
};

export const getLichPhanCong = async ({ startDate, endDate }) => {
  const response = await axiosClient.get(
    `/api/nhanvien/lich-phan-cong?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const createNhanVien = async (payload) => {
  const response = await axiosClient.post("/api/nhanvien", payload);
  return response.data;
};

export const updateNhanVien = async (id, payload) => {
  const response = await axiosClient.put(`/api/nhanvien/${id}`, payload);
  return response.data;
};

export const deleteNhanVien = async (id) => {
  const response = await axiosClient.delete(`/api/nhanvien/${id}`);
  return response.data;
};

export const createPhanCong = async (payload) => {
  const response = await axiosClient.post("/api/nhanvien/phan-cong", payload);
  return response.data;
};

export const deletePhanCong = async (payload) => {
  const response = await axiosClient.delete("/api/nhanvien/phan-cong", {
    data: payload,
  });
  return response.data;
};
