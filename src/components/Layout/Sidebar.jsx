import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Users, 
  UserCheck, 
  FolderOpen, 
  Star, 
  BarChart3, 
  X,
  GraduationCap,
  Ticket,
  Layers,
  MessageSquare
} from 'lucide-react';
import { MdPayment } from 'react-icons/md';
import { GiLever } from 'react-icons/gi';

const navigation = [
  { name: 'Trang quản lý', href: '/', icon: Home },
  { name: 'Khóa học', href: '/courses', icon: BookOpen },
  { name: 'Người dùng', href: '/users', icon: Users },
  { name: 'Hồ sơ giảng viên', href: '/instructors', icon: UserCheck },
  { name: 'Danh mục', href: '/categories', icon: FolderOpen },
  { name: 'Trình độ', href: '/levels', icon: Layers },
  { name: 'Đánh giá', href: '/reviews', icon: Star },
  { name: 'Thống kê', href: '/analytics', icon: BarChart3 },
  { name: 'Mã giảm giá', href: '/vouchers', icon: Ticket },
  { name: 'Hóa đơn', href: '/payment', icon: MdPayment },
  { name: 'Tin nhắn', href: '/messages', icon: MessageSquare },
  
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">LMS Admin</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;