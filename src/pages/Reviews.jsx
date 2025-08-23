import { useEffect, useState } from 'react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { approveCourseReview, fetchCourseReviews, rejectCourseReview } from '../API/courseReviewApi';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchCourseReviews();
        setReviews(res || []);
       
      } catch (error) {
        console.error('Lỗi khi tải đánh giá:', error);
      }
    };
    fetchData();
  }, []);
 console.log("Fetched reviews:", reviews);
  const columns = [
    {
      header: 'Khóa học',
      accessor: 'courseName',
      render: (review) => (
        <div>
          <p className="font-medium text-gray-900">{review.courseName}</p>
          <p className="text-sm text-gray-500">by {review.studentName}</p>
        </div>
      )
    },
    {
      header: 'Đánh giá',
      accessor: 'rating',
      render: (review) => (
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
        </div>
      )
    },
    {
      header: 'Bình luận',
      accessor: 'comment',
      render: (review) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">
          {review.comment}
        </p>
      )
    },
    {
      header: 'Ngày bình luận',
      accessor: 'date',
      render: (review) => new Date(review.date).toLocaleDateString()
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (review) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          review.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {review.status}
        </span>
      )
    }
  ];

  const handleView = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleApprove = async (review) => {
  try {
    await approveCourseReview(review.id);
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'APPROVED' } : r));
    toast.success("Đã duyệt đánh giá thành công");
    setIsModalOpen(false);
  } catch (err) {
    console.error("Lỗi duyệt:", err);
    toast.error("Lỗi khi duyệt đánh giá");
  }
};

const handleReject = async (review) => {
  try {
    await rejectCourseReview(review.id);
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'FLAGGED' } : r));
    toast.success("Đã từ chối đánh giá thành công");
    setIsModalOpen(false);
  } catch (err) {
    console.error("Lỗi từ chối:", err);
    toast.error("Lỗi khi từ chối đánh giá");
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Đánh giá</h1>
      </div>

      <DataTable
        data={reviews}
        columns={columns}
        onView={handleView}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
         <ReviewDetails 
  review={selectedReview}
  onApprove={handleApprove}
  onReject={handleReject}
  onClose={() => setIsModalOpen(false)}
  onSuccess={() => {
    setIsModalOpen(false);
  }}
/>

        )}
      </Modal>
    </div>
  );
};

const ReviewDetails = ({ review, onApprove, onReject, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
          <p className="text-gray-900">{review.courseName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Học viên</label>
          <p className="text-gray-900">{review.studentName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá</label>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đánh giá</label>
          <p className="text-gray-900">{new Date(review.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bình luận</label>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900">{review.comment}</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(review)}
            className="btn-success"
            disabled={review.status === 'APPROVED'}
          >
            Chấp nhận
          </button>
          <button
            onClick={() => onReject(review)}
            className="btn-error"
            disabled={review.status === 'FLAGGED'}
          >
            Từ chối
          </button>
        </div>
        <button onClick={onClose} className="btn-secondary">
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Reviews;
