import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3001",
});

/** Tự động set Content-Type dựa trên dữ liệu gửi đi */
axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Không set Content-Type — để axios tự động set multipart/form-data kèm boundary
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
