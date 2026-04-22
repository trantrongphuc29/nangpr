import axios from "axios";

const LOGIN_BASE_URL = "http://172.31.192.1:3000";

export const login = async (payload) => {
  const response = await axios.post(`${LOGIN_BASE_URL}/api/login`, payload);
  return response.data;
};
