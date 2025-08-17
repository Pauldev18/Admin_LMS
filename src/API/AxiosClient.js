// src/services/axiosInstance.js
import axios from "axios";

const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

AxiosClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth") || sessionStorage.getItem("auth");
    let token;

    if (raw) {
      const auth = JSON.parse(raw);
      token = auth?.accessToken || auth?.token;
    }
    if (!token) {
      token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
  }
  return config;
});

AxiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 400 || err?.response?.status === 403) {
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");
       window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default AxiosClient;
