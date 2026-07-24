import axios from "axios";
import AuthHelper from "./auth";
import Toast from "react-native-toast-message";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AuthHelper.getToken();
  if (token) {
    config.headers.token = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await AuthHelper.clearToken();
      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please login again",
      });
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
    });

    return Promise.reject(error);
  }
);

export default api;
