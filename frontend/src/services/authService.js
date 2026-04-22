import axiosClient from "./axiosClient";

export const login = async (payload) => {
  const response = await axiosClient.post("/api/login", payload);
  return response.data;
};
