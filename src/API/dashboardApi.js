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
