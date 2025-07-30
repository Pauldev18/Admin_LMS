import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { mockCourses } from '../data/mockData';

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Course',
      accessor: 'title',
      render: (course) => (
        <div className="flex items-center space-x-3">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{course.title}</p>
            <p className="text-sm text-gray-500">{course.instructor}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (course) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {course.category}
        </span>
      )
    },
    {
      header: 'Level',
      accessor: 'level',
      render: (course) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
          course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {course.level}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (course) => (
        <div>
          {course.discountPrice ? (
            <div>
              <span className="text-gray-500 line-through text-sm">${course.price}</span>
              <span className="ml-2 font-medium text-green-600">${course.discountPrice}</span>
            </div>
          ) : (
            <span className="font-medium">${course.price}</span>
          )}
        </div>
      )
    },
    {
      header: 'Students',
      accessor: 'numStudents',
      render: (course) => course.numStudents.toLocaleString()
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (course) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">★</span>
          <span>{course.rating}</span>
          <span className="text-gray-500 text-sm">({course.numReviews})</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (course) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
            {course.status}
          </span>
          <button
            onClick={() => handleStatusChange(course)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
            title="Change status"
          >
            <Edit className="h-3 w-3" />
          </button>
        </div>
      )
    }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course) => {
    setModalMode('edit');
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleView = (course) => {
    setModalMode('view');
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = (course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      console.log('Deleting course:', course);
    }
  };

  const handleStatusChange = (course) => {
    setSelectedCourse(course);
    setStatusModalOpen(true);
  };

  const updateCourseStatus = (newStatus) => {
    console.log(`Updating course ${selectedCourse.id} status to ${newStatus}`);
    // Here you would typically make an API call to update the status
    setStatusModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <select className="input w-auto">
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Archived">Archived</option>
            </select>
            <select className="input w-auto">
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      <DataTable
        data={mockCourses}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Course Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Create New Course' :
          modalMode === 'edit' ? 'Edit Course' :
          'Course Details'
        }
        size="lg"
      >
        <CourseForm 
          course={selectedCourse} 
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Change Course Status"
        size="sm"
      >
        <StatusChangeForm 
          course={selectedCourse}
          onStatusChange={updateCourseStatus}
          onClose={() => setStatusModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const StatusChangeForm = ({ course, onStatusChange, onClose }) => {
  const [newStatus, setNewStatus] = useState(course?.status || '');
  const [reason, setReason] = useState('');

  const statusOptions = [
    { value: 'Draft', label: 'Draft', description: 'Course is being prepared' },
    { value: 'Under Review', label: 'Under Review', description: 'Course is being reviewed for approval' },
    { value: 'Published', label: 'Published', description: 'Course is live and available to students' },
    { value: 'Archived', label: 'Archived', description: 'Course is no longer available for new enrollments' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onStatusChange(newStatus);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{course?.title}</h3>
        <p className="text-sm text-gray-500">Current status: <span className="font-medium">{course?.status}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={newStatus === option.value}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change (Optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="3"
          className="input"
          placeholder="Explain why you're changing the status..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={!newStatus || newStatus === course?.status}
        >
          Update Status
        </button>
      </div>
    </form>
  );
};

const CourseForm = ({ course, mode, onClose }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    instructor: course?.instructor || '',
    category: course?.category || '',
    level: course?.level || '',
    price: course?.price || '',
    discountPrice: course?.discountPrice || '',
    description: course?.description || '',
    status: course?.status || 'Draft',
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <p className="text-gray-900">{course.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <p className="text-gray-900">{course.instructor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <p className="text-gray-900">{course.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <p className="text-gray-900">{course.level}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <p className="text-gray-900">${course.price}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
            <p className="text-gray-900">{course.numStudents}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              course.status === 'Published' ? 'bg-green-100 text-green-800' :
              course.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              course.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <p className="text-gray-900">{course.rating} ⭐ ({course.numReviews} reviews)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
          <input
            type="text"
            value={formData.instructor}
            onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="input"
            required
          >
            <option value="">Select Category</option>
            <option value="Web Development">Web Development</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="input"
            required
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.discountPrice}
            onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
            className="input"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="input"
            required
          >
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="4"
          className="input"
          placeholder="Course description..."
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {mode === 'create' ? 'Create Course' : 'Update Course'}
        </button>
      </div>
    </form>
  );
};

export default Courses;