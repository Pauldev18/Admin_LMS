import { useState } from 'react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { mockReviews } from '../data/mockData';

const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const columns = [
    {
      header: 'Course',
      accessor: 'courseName',
      render: (review) => (
        <div>
          <p className="font-medium text-gray-900">{review.courseName}</p>
          <p className="text-sm text-gray-500">by {review.studentName}</p>
        </div>
      )
    },
    {
      header: 'Rating',
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
      header: 'Comment',
      accessor: 'comment',
      render: (review) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">
          {review.comment}
        </p>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (review) => new Date(review.date).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (review) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          review.status === 'Approved' ? 'bg-green-100 text-green-800' :
          review.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
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

  const handleApprove = (review) => {
    console.log('Approving review:', review);
  };

  const handleReject = (review) => {
    console.log('Rejecting review:', review);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <div className="flex space-x-3">
          <button className="btn-secondary">Export Reviews</button>
          <button className="btn-primary">Bulk Actions</button>
        </div>
      </div>

      <DataTable
        data={mockReviews}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <p className="text-gray-900">{review.courseName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
          <p className="text-gray-900">{review.studentName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <p className="text-gray-900">{new Date(review.date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900">{review.comment}</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(review)}
            className="btn-success"
            disabled={review.status === 'Approved'}
          >
            Approve
          </button>
          <button
            onClick={() => onReject(review)}
            className="btn-error"
            disabled={review.status === 'Flagged'}
          >
            Reject
          </button>
        </div>
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
};

export default Reviews;