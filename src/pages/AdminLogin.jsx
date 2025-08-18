// src/pages/AdminLogin.jsx
import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { login } from "../API/authApi";
import { resetAuthHandledFlag } from "../API/AxiosClient";

const normalizeRole = (r) => String(r || "").replace(/^ROLE_/i, "").toUpperCase();

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      const res = await login(form.email.trim(), form.password);
      const data = res?.data || {};

      // Chuẩn hoá dữ liệu theo BE bạn gửi
      const accessToken = data.accessToken || data.token;
      const primaryRole = normalizeRole(
        data?.user?.role ?? data?.roles?.[0]?.authority
      );

      const user = {
        id: data?.user?.id || data?.id,
        email: data?.user?.email || data?.email,
        name: data?.user?.name || data?.name,
        role: primaryRole,
      };

      if (!accessToken || !user.email) {
        toast.error("Phản hồi đăng nhập không hợp lệ");
        return;
      }
      if (user.role !== "ADMIN") {
        toast.error("Tài khoản không có quyền ADMIN");
        return;
      }

      // Lưu thống nhất 1 shape
      const payload = JSON.stringify({
        accessToken,
        user,
        // lưu cả mảng roles thô nếu cần dùng
        roles: data.roles,
      });
      if (form.remember) localStorage.setItem("auth", payload);
      else sessionStorage.setItem("auth", payload);
      resetAuthHandledFlag();
      toast.success("Đăng nhập thành công!");
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data || err?.message || "Đăng nhập thất bại";
      toast.error(typeof msg === "string" ? msg : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Login</h1>
              <p className="text-sm text-gray-500">Đăng nhập để truy cập bảng điều khiển</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input w-full"
                placeholder="admin@yourdomain.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={form.remember}
                  onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
                />
                Nhớ đăng nhập
              </label>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="btn-primary w-full disabled:opacity-70" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} LMS Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
