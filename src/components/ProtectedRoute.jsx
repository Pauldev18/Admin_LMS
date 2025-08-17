// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const getAuth = () => {
  const raw = localStorage.getItem("auth") || sessionStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeRole = (r) => String(r || "").replace(/^ROLE_/i, "").toUpperCase();

const getRoles = (auth) => {
  if (!auth) return [];
  const roles = [];

  // 1) Nếu bạn lưu user.role = "ADMIN"
  if (auth.user?.role) roles.push(auth.user.role);

  // 2) Nếu BE trả về roles = [{ authority: "ROLE_ADMIN" }, ...]
  if (Array.isArray(auth.roles)) {
    roles.push(...auth.roles.map((r) => r?.authority ?? r));
  }

  // Chuẩn hoá & unique
  return Array.from(new Set(roles.map(normalizeRole))).filter(Boolean);
};

export default function ProtectedRoute({ allow = ["ADMIN"] }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/admin/login" replace />;

  const userRoles = getRoles(auth);
  const allowed = (Array.isArray(allow) ? allow : [allow]).map(normalizeRole);

  const hasAccess = userRoles.some((r) => allowed.includes(normalizeRole(r)));

  if (!hasAccess) return <Navigate to="/403" replace />;
  return <Outlet />;
}
