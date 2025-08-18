// src/services/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";
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
let isAuthErrorHandled = false;

// (Optional) export để chỗ khác reset sau khi login thành công
export const resetAuthHandledFlag = () => { isAuthErrorHandled = false; };

AxiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if ((status === 400 || status === 401 || status === 403) && !isAuthErrorHandled) {
      isAuthErrorHandled = true;

      // dọn auth
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");

      // show toast 1 lần
      const msg =
        status === 403
          ? "Bạn không có quyền truy cập."
          : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      toast.error(msg);

      // redirect sau 1s để user thấy toast
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 3000);
    }

    return Promise.reject(err);
  }
);
export default AxiosClient;
