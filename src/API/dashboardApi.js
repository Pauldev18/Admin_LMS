import AxiosClient from "./AxiosClient";

export const fetchDashboardStats = async () => {
  const response = await AxiosClient.get('/api/dashboard/stats');
  return response.data;
};
export const fetchMonthlyStats = async () => {
  const res = await AxiosClient.get("/api/dashboard/monthly-stats");
  return res.data;
};
export const fetchRecentEnrollments = async () => {
  const res = await AxiosClient.get("/api/dashboard/recent-enrollments");
  return res.data;
};
export const fetchTopCourses = async () => {
  const res = await AxiosClient.get("/api/dashboard/top-courses");
  return res.data;
};

export const fetchAnalyticsStats = async (startDate, endDate) => {
  const res = await AxiosClient.get('/api/dashboard/statistics', {
    params: {
      startDate: startDate, // ISO string format for LocalDateTime
      endDate: endDate      // ISO string format for LocalDateTime
    }
  });
  return res.data;
};
export const fetchMonthlyBreakdown = async (startDate, endDate) => {
  const res = await AxiosClient.get('/api/dashboard/monthly-breakdown', {
    params: {
      startDate, // dạng '2025-01-01'
      endDate    // dạng '2025-08-01'
    }
  });
  return res.data;
};

export const fetchCategoryStats = async (startDate, endDate) => {
  const res = await AxiosClient.get('/api/dashboard/category-stats', {
    params: {
      startDate, // dạng '2025-01-01'
      endDate    // dạng '2025-08-01'
    }
  });
  return res.data;
};