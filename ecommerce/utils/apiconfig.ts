"use client";
import Helper from "@/helper/helper";
import loadingStore from "@/zustand/loading.store";
import { userStore } from "@/zustand/user.store";
import axios from "axios";
import toast from "react-hot-toast"; // ১. ইমপোর্ট করুন

export const base_url = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: base_url,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    loadingStore.getState().setGlobalLoader(true);
    config.headers.token = Helper.getToken();
    return config;
  },
  (error) => {
    loadingStore.getState().setGlobalLoader(false);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    loadingStore.getState().setGlobalLoader(false);

    // method 'get' না হলে এবং msg বা message থাকলে টোস্ট দেখাবে
    if (response.config.method !== "get") {
      const successMsg = response.data?.msg || response.data?.message;
      if (successMsg) {
        toast.success(successMsg);
      }
    }

    return response;
  },
  (error) => {
    loadingStore.getState().setGlobalLoader(false);

    // এরর মেসেজের ক্ষেত্রেও msg বা message চেক করুন
    const errorMessage =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      "Something went wrong!";

    if (error.response?.status === 401) {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";

      const isProtectedRoute =
        currentPath.startsWith("/admin") || currentPath.startsWith("/user");

      if (isProtectedRoute) {
        toast.error("Session Expired. Please login again.");
        Helper.clearToken();
        userStore.getState().setUser(null);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } else {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default api;
