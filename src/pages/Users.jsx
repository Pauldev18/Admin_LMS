import { useEffect, useState } from 'react';
import { Lock, Plus, Unlock } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { fetchUsers, createUser, updateUser, lockUser, unlockUser } from '../API/userApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách user:", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

    const handleToggleActive = async (user) => {
    const isCurrentlyActive = !!user.active;
    const actionText = isCurrentlyActive ? "khóa" : "mở khóa";
    const confirmBtnText = isCurrentlyActive ? "Khóa" : "Mở khóa";

    const result = await Swal.fire({
      title: `Xác nhận ${actionText}?`,
      text: `Bạn có chắc chắn muốn ${actionText} user "${user.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isCurrentlyActive ? "#d33" : "#16a34a", 
      cancelButtonColor: "#3085d6",
      confirmButtonText: confirmBtnText,
      cancelButtonText: "Huỷ",
    });

    if (!result.isConfirmed) return;

    try {
      if (isCurrentlyActive) {
        await lockUser(user.id);
        toast.success("Đã khóa user!");
      } else {
        await unlockUser(user.id);
        toast.success("Đã mở khóa user!");
      }
      await loadUsers();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái user:", err);
      toast.error("Đã xảy ra lỗi!");
    }
  };
  const columns = [
    {
      header: 'Người dùng',
      accessor: 'name',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Quyền',
      accessor: 'role',
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role}
        </span>
      )
    },
   {
    header: 'Số khóa học đã đăng ký',
    accessor: 'enrolledCourses',
    render: (course) => (
      <div className="w-full text-center">
        {course.enrolledCourses}
      </div>
    ),
  }
  ,
    {
      header: 'Ngày tham gia',
      accessor: 'joinDate',
      render: (user) => new Date(user.joinDate).toLocaleDateString()
    },
    {
      header: 'Trạng thái',
      accessor: 'active',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Người dùng</h1>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </button>
      </div>

      <DataTable
      data={users}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleToggleActive} 
      onView={handleView}
      getDeleteLabel={(row) => (row.active ? 'Khóa' : 'Mở khóa')}
      getDeleteIcon={(row) => (row.active ? Lock : Unlock)}
    />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Thêm mới người dùng' :
          modalMode === 'edit' ? 'Sửa thông tin người dùng' :
          'Thông tin chi tiêt'
        }
      >
        <UserForm
          user={selectedUser}
          mode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            loadUsers();
          }}
        />
      </Modal>
    </div>
  );
};

// 🧩 FORM gộp chung luôn
const UserForm = ({ user, mode, onClose }) => {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'USER',
    active: user?.active ?? true,
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: formData.active,
      ...(isCreate ? { password: formData.password } : {})
    };

    try {
      if (isCreate) {
        await createUser(payload);
        toast.success("Thêm thành công!");
      } else if (isEdit) {
        await updateUser(user.id, payload);
        toast.success("Cập nhật thành công!");
      }
      onClose();
    } catch (err) {
      console.error('Lỗi submit user:', err);
      toast.error("Đã xảy ra lỗi!");
    }
  };

if (isView) {
  return (
    <div className="max-w-[120vw]">
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg space-y-6">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <span>👤</span> Thông tin người dùng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* mỗi item cần min-w-0 để truncate/break hoạt động trong grid */}
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-blue-600 mb-1">Tên</label>
            <p className="text-gray-900 text-lg font-medium break-words">
              {user.name}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-indigo-600 mb-1">Email</label>
            <p className="text-gray-900 break-words">
              {user.email}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-green-600 mb-1">Quyền</label>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              user.role === 'ADMIN'
                ? 'bg-red-100 text-red-700'
                : user.role === 'INSTRUCTOR'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role}
            </span>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-yellow-600 mb-1">Trạng thái</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              user.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
            }`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="bg-pink-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-pink-600 mb-1">Số khóa học đã đăng ký</label>
            <p className="text-gray-900 break-words">{user.enrolledCourses}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 shadow-sm min-w-0">
            <label className="block text-sm font-semibold text-orange-600 mb-1">Ngày tham gia</label>
            <p className="text-gray-900">{new Date(user.joinDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Họ và tên" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} />
        <FormInput label="Email" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} />
        <FormSelect label="Quyền" value={formData.role} onChange={(val) => setFormData({ ...formData, role: val })}
          options={[
            { label: 'User', value: 'USER' },
            { label: 'Instructor', value: 'INSTRUCTOR' },
            { label: 'Admin', value: 'ADMIN' }
          ]}
        />
        <FormSelect label="Trạng thái" value={formData.active ? 'true' : 'false'} onChange={(val) => setFormData({ ...formData, active: val === 'true' })}
          options={[
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' }
          ]}
        />
      </div>

      {isCreate && (
        <FormInput
          label="Mật khẩu"
          type="password"
          value={formData.password}
          onChange={(val) => setFormData({ ...formData, password: val })}
        />
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">
          {isCreate ? 'Thêm người dùng' : 'Cập nhật'}
        </button>
      </div>
    </form>
  );
};

// 🔸 Component con nhỏ
const FormInput = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" required />
  </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input" required>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const FormRead = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <p className="text-gray-900">{value}</p>
  </div>
);

export default Users;
