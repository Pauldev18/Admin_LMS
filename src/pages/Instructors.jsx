import { useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { mockInstructors } from '../data/mockData';

const Instructors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const columns = [
    {
      header: 'Instructor',
      accessor: 'name',
      render: (instructor) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {instructor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{instructor.name}</p>
            <p className="text-sm text-gray-500">{instructor.title}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Courses',
      accessor: 'courses'
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (instructor) => instructor.students.toLocaleString()
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (instructor) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">★</span>
          <span>{instructor.rating}</span>
        </div>
      )
    },
    {
      header: 'Revenue',
      accessor: 'revenue',
      render: (instructor) => `$${instructor.revenue.toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (instructor) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          instructor.status === 'Active' ? 'bg-green-100 text-green-800' :
          instructor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {instructor.status}
        </span>
      )
    }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setSelectedInstructor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (instructor) => {
    setModalMode('edit');
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleView = (instructor) => {
    setModalMode('view');
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleDelete = (instructor) => {
    if (confirm(`Are you sure you want to delete instructor "${instructor.name}"?`)) {
      console.log('Deleting instructor:', instructor);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </button>
      </div>

      <DataTable
        data={mockInstructors}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Create New Instructor' :
          modalMode === 'edit' ? 'Edit Instructor' :
          'Instructor Details'
        }
        size="lg"
      >
        <InstructorForm 
          instructor={selectedInstructor} 
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const InstructorForm = ({ instructor, mode, onClose }) => {
  const [formData, setFormData] = useState({
    name: instructor?.name || '',
    email: instructor?.email || '',
    title: instructor?.title || '',
    bio: instructor?.bio || '',
    status: instructor?.status || 'Pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onClose();
  };

  if (mode === 'view') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{instructor.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{instructor.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <p className="text-gray-900">{instructor.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <p className="text-gray-900">{instructor.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Courses</label>
            <p className="text-gray-900">{instructor.courses}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
            <p className="text-gray-900">{instructor.students.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <p className="text-gray-900">{instructor.rating} ⭐</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
            <p className="text-gray-900">${instructor.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="input"
            placeholder="e.g., Senior Full Stack Developer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="input"
            required
          >
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows="4"
          className="input"
          placeholder="Brief bio about the instructor..."
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {mode === 'create' ? 'Create Instructor' : 'Update Instructor'}
        </button>
      </div>
    </form>
  );
};

export default Instructors;