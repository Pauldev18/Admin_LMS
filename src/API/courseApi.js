import AxiosClient from "./AxiosClient";

export const fetchCourseSummaries = async () => {
  try {
    const res = await AxiosClient.get("/api/admin/courses/summaries");
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API course summaries:", error);
    throw error;
  }
};

export const fetchAllCourse = async () => {
  try {
    const res = await AxiosClient.get("/api/courses");
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API course:", error);
    throw error;
  }
};

export async function updateCourseStatusAPI(courseId, status) {
  try {
    const res = await AxiosClient.put('/api/admin/courses/status', {
      courseId,
      status
    });
    return res.data;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật trạng thái khoá học:', error);
    throw error;
  }
}