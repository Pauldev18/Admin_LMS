import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { fetchUsers, createUser, updateUser, deleteUser } from '../API/userApi';
import { toast } from 'react-toastify';

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

  const handleDelete = async (user) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        await deleteUser(user.id);
        toast.success("User deleted!");
        await loadUsers();
      } catch (err) {
        console.error("Lỗi xoá user:", err);
         toast.error("Đã xảy ra lỗi!");
      }
    }
  };

  const columns = [
    {
      header: 'User',
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
      header: 'Role',
      accessor: 'role',
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role}
        </span>
      )
    },
    {
      header: 'Enrolled Courses',
      accessor: 'enrolledCourses'
    },
    {
      header: 'Join Date',
      accessor: 'joinDate',
      render: (user) => new Date(user.joinDate).toLocaleDateString()
    },
    {
      header: 'Status',
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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Create New User' :
          modalMode === 'edit' ? 'Edit User' :
          'User Details'
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
        toast.success("User created!");
      } else if (isEdit) {
        await updateUser(user.id, payload);
        toast.success("User updated!");
      }
      onClose();
    } catch (err) {
      console.error('Lỗi submit user:', err);
      toast.error("Đã xảy ra lỗi!");
    }
  };

  if (isView) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormRead label="Name" value={user.name} />
          <FormRead label="Email" value={user.email} />
          <FormRead label="Role" value={user.role} />
          <FormRead label="Status" value={user.active ? 'Active' : 'Inactive'} />
          <FormRead label="Enrolled Courses" value={user.enrolledCourses} />
          <FormRead label="Join Date" value={new Date(user.joinDate).toLocaleDateString()} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Full Name" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} />
        <FormInput label="Email" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} />
        <FormSelect label="Role" value={formData.role} onChange={(val) => setFormData({ ...formData, role: val })}
          options={[
            { label: 'User', value: 'USER' },
            { label: 'Instructor', value: 'INSTRUCTOR' },
            { label: 'Admin', value: 'ADMIN' }
          ]}
        />
        <FormSelect label="Status" value={formData.active ? 'true' : 'false'} onChange={(val) => setFormData({ ...formData, active: val === 'true' })}
          options={[
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' }
          ]}
        />
      </div>

      {isCreate && (
        <FormInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(val) => setFormData({ ...formData, password: val })}
        />
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">
          {isCreate ? 'Create User' : 'Update User'}
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
