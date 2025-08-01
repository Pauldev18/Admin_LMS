import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { createInstructor, deleteInstructor, fetchEligibleUsers, fetchInstructors, updateInstructor } from '../API/instructorApi';
import { v4 as uuidv4 } from 'uuid';

const Instructors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [instructors, setInstructors] = useState([]);

  const [eligibleUsers, setEligibleUsers] = useState([]);

  const loadEligibleUsers = async () => {
    try {
      const res = await fetchEligibleUsers();
      setEligibleUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách user đủ điều kiện:", err);
    }
  };

  useEffect(() => {
    loadEligibleUsers();
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchInstructors();
      setInstructors(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách instructors:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    { header: 'Courses', accessor: 'totalCourses' },
    { header: 'Students', accessor: 'numStudents', render: (i) => i.numStudents.toLocaleString() },
    { header: 'Rating', accessor: 'rating', render: (i) => <span className="text-yellow-500">★ {i.rating}</span> },
    { header: 'Reviews', accessor: 'numReviews' },
    { header: 'Status', accessor: 'isActive', render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${i.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {i.isActive ? 'Active' : 'Inactive'}
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

  const handleDelete = async (instructor) => {
    if (confirm(`Bạn có chắc chắn muốn xoá instructor "${instructor.name}"?`)) {
      try {
        await deleteInstructor(instructor.id);
        alert('Đã xoá thành công!');
        loadData();
      } catch (error) {
        console.error('Lỗi xoá:', error);
        alert('Xoá thất bại!');
      }
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
      <DataTable data={instructors} columns={columns} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Instructor' : modalMode === 'edit' ? 'Edit Instructor' : 'Instructor Details'}
        size="lg"
      >
       <InstructorForm
        instructor={selectedInstructor}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        reload={loadData}
        eligibleUsers={eligibleUsers}
      />

      </Modal>
    </div>
  );
};

const InstructorForm = ({ instructor, mode, onClose, reload, eligibleUsers }) => {
  const [formData, setFormData] = useState({
    name: instructor?.name || '',
    title: instructor?.title || '',
    bio: instructor?.bio || '',
    profilePicture: instructor?.profilePicture || '',
    website: instructor?.website || '',
    twitter: instructor?.twitter || '',
    linkedin: instructor?.linkedin || '',
    youtube: instructor?.youtube || '',
    expertises: instructor?.expertises || '',
    isActive: instructor?.isActive ?? true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        const newInstructor = {
        userId: formData.id,            
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        youtube: formData.youtube,
        expertises: formData.expertises,
        isActive: formData.isActive,
        profilePicture: formData.profilePicture || ''
        
      };
      const res = await createInstructor(newInstructor);
      if (res.data === true) {
        onClose();
        reload();
      } else {
        alert("Tạo instructor thất bại.");
      }
      } else {
        await updateInstructor(instructor.id, formData);
      }
      onClose();
      reload();
    } catch (err) {
      console.error("Lỗi submit instructor:", err);
      alert('Gửi thất bại!');
    }
  };

  if (mode === 'view') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <p><b>Name:</b> {instructor.name}</p>
          <p><b>Title:</b> {instructor.title}</p>
          <p><b>Bio:</b> {instructor.bio}</p>
          <p><b>Status:</b> {instructor.isActive ? 'Active' : 'Inactive'}</p>
          <p><b>Courses:</b> {instructor.totalCourses}</p>
          <p><b>Students:</b> {instructor.numStudents.toLocaleString()}</p>
          <p><b>Rating:</b> {instructor.rating}</p>
          <p><b>Reviews:</b> {instructor.numReviews}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'create' && (
    <select
      className="input w-full"
      value={formData.id}
      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
      required
    >
      <option value="">-- Chọn user --</option>
      {eligibleUsers.map(user => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.email})
        </option>
      ))}
    </select>
  )}
      <div className="grid grid-cols-2 gap-4">
        <input type="text" className="input" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="text" className="input" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <input type="text" className="input" placeholder="Website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
        <input type="text" className="input" placeholder="Twitter" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} />
        <input type="text" className="input" placeholder="LinkedIn" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
        <input type="text" className="input" placeholder="YouTube" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} />
      </div>
      <textarea className="input w-full" rows="3" placeholder="Bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
      <textarea className="input w-full" rows="2" placeholder="Expertises" value={formData.expertises} onChange={e => setFormData({...formData, expertises: e.target.value})}></textarea>
      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
          <span className="text-sm">Active</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{mode === 'create' ? 'Create Instructor' : 'Update Instructor'}</button>
      </div>
    </form>
  );
};

export default Instructors;
