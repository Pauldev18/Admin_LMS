// src/components/Layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, User, LogOut, ChevronDown } from "lucide-react";

const getAuth = () => {
  try {
    const raw = localStorage.getItem("auth") || sessionStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const auth = getAuth();
  const name = auth?.user?.name || auth?.name || "Admin";
  const email = auth?.user?.email || auth?.email || "admin@lms.com";
  const role = (auth?.user?.role || auth?.roles?.[0]?.authority || "ADMIN")
    .toString()
    .replace(/^ROLE_/i, "")
    .toUpperCase();

  const initials = name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    sessionStorage.removeItem("auth");
    navigate("/admin/login", { replace: true });
  };
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
          </div> */}
        </div>

        <div className="flex items-center space-x-4" ref={menuRef}>
          {/* <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-error-500 rounded-full"></span>
          </button> */}

         
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-3 rounded-lg hover:bg-gray-100 px-2 py-1"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {initials || <User className="h-4 w-4 text-white" />}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
