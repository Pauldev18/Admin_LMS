import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useEffect } from 'react';
import { fetchCourseSummaries, updateCourseStatusAPI } from '../API/courseApi';
import Swal from 'sweetalert2';



const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [categories, setCategories] = useState([]);

  const loadCourses = async () => {
    try {
      const data = await fetchCourseSummaries();
      setCourses(data);
      const uniqueCategories = [...new Set(data.map(course => course.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Lỗi khi load danh sách khóa học:", err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISABLED':
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
              <span className="text-gray-500 line-through text-sm">${Number(course.price).toLocaleString('vi-VN')}</span>
              <span className="ml-2 font-medium text-green-600">${Number(course.discountPrice).toLocaleString('vi-VN')}</span>
            </div>
          ) : (
            <span className="font-medium">${Number(course.price).toLocaleString('vi-VN')}</span>
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

const handleStatusChange = (course) => {
    setSelectedCourse(course);
    setStatusModalOpen(true);
  };

  const updateCourseStatus = async (newStatus) => {
    try {
      await updateCourseStatusAPI(selectedCourse.id, newStatus);
      await loadCourses();
    } catch (err) {
      console.error("Cập nhật trạng thái thất bại:", err);
    } finally {
      setStatusModalOpen(false);
      setSelectedCourse(null);
    }
  };
const handleDelete = async (course) => {
  const result = await Swal.fire({
    title: 'Xác nhận xoá?',
    html: `Bạn có chắc chắn muốn xoá <b>${course.title}</b> không?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      console.log("Xoá khoá học:", course.id);
      await updateCourseStatusAPI(course.id, 'DISABLED'); 
      await loadCourses();
      Swal.fire({
        icon: 'success',
        title: 'Đã xoá',
        text: `Khoá học "${course.title}" đã được xoá.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("❌ Xoá khoá học thất bại:", err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể xoá khoá học. Vui lòng thử lại!'
      });
    }
  }
};

const filteredCourses = courses.filter(course => {
  const byStatus = filters.status ? course.status === filters.status : true;
  const byCategory = filters.category ? course.category === filters.category : true;
  return byStatus && byCategory;
});


 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
           <select
              className="input w-auto"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Đang chờ duyệt</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
              <option value="DISABLED">Đã xóa</option>
            </select>

            <select
              className="input w-auto"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

          </div>
        
        </div>
      </div>

    {courses.length === 0 ? (
      <div>Đang tải dữ liệu khoá học...</div>
    ) : (
      <DataTable
        data={filteredCourses}
        columns={columns}
        // onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    )}


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
    {
      value: 'DRAFT',
      label: 'Đang duyệt',
      description: 'Khóa học đang chờ phê duyệt'
    },
    {
      value: 'PUBLISHED',
      label: 'Xuất bản',
      description: 'Khóa học đã được công khai cho học viên'
    },
    {
      value: 'ARCHIVED',
      label: 'Lưu trữ',
      description: 'Khóa học không còn được ghi danh mới'
    }
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
    status: course?.status || 'DRAFT',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onClose();
  };

  if (mode === 'view') {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
        📘 Thông tin khoá học
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-blue-600 mb-1">Title</label>
          <p className="text-gray-900 text-lg font-medium">{course.title}</p>
        </div>

        {/* Instructor */}
        <div className="bg-indigo-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-indigo-600 mb-1">Instructor</label>
          <p className="text-gray-900">{course.instructor}</p>
        </div>

        {/* Category */}
        <div className="bg-green-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-green-600 mb-1">Category</label>
          <p className="text-gray-900">{course.category}</p>
        </div>

        {/* Level */}
        <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-purple-600 mb-1">Level</label>
          <p className="text-gray-900">{course.level}</p>
        </div>

        {/* Price */}
        <div className="bg-pink-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-pink-600 mb-1">Price</label>
          <p className="text-gray-900 font-bold">
            {Number(course.price).toLocaleString('vi-VN')} đ
          </p>
        </div>

        {/* Students */}
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-yellow-600 mb-1">Students</label>
          <p className="text-gray-900">{course.numStudents}</p>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              course.status === 'Published'
                ? 'bg-green-100 text-green-800'
                : course.status === 'Draft'
                ? 'bg-gray-200 text-gray-800'
                : course.status === 'Under Review'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {course.status}
          </span>
        </div>

        {/* Rating */}
        <div className="bg-orange-50 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-orange-600 mb-1">Rating</label>
          <p className="text-gray-900">
            {course.rating ?? 0} ⭐ ({course.numReviews} reviews)
          </p>
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