import AxiosClient from './AxiosClient';

export const fetchCourseReviews = async () => {
  try {
    const res = await AxiosClient.get('/api/reviews');
    return res.data;
  } catch (error) {
    console.error('Lỗi khi fetch reviews:', error);
    throw error;
  }
};

export const approveCourseReview = async (id) => {
  try {
    const res = await AxiosClient.put(`/api/reviews/${id}/approve`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi duyệt review:', error);
    throw error;
  }
};

export const rejectCourseReview = async (id) => {
  try {
    const res = await AxiosClient.put(`/api/reviews/${id}/reject`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi từ chối review:', error);
    throw error;
  }
};
