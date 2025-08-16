import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  UserCheck,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import {
  fetchDashboardStats,
  fetchMonthlyStats,
  fetchRecentEnrollments,
  fetchTopCourses,              // nếu bạn vẫn dùng chỗ khác
  fetchTopPerformingCourses     // dùng cho Top Performing
} from '../API/dashboardApi';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);

  // --- Top Performing Courses ---
  const [topCourses, setTopCourses] = useState([]);
  const [topLoading, setTopLoading] = useState(false);

  // chọn khoảng thời gian (tháng): 1 | 3 | 6 | 12
  const [topMonths, setTopMonths] = useState(6);

  // chọn tiêu chí sắp xếp: enrollments | rating | active | reviews
  const [sortBy, setSortBy] = useState('enrollments');

  // Load Top Performing Courses theo months + sortBy
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTopLoading(true);
        const data = await fetchTopPerformingCourses({
          months: topMonths,
          sortBy,
          limit: 5
        });
        if (mounted) setTopCourses(data || []);
      } catch (e) {
        console.error('Lỗi khi load Top Performing Courses:', e);
        if (mounted) setTopCourses([]);
      } finally {
        if (mounted) setTopLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [topMonths, sortBy]);

  // Load Recent Enrollments
  useEffect(() => {
    fetchRecentEnrollments()
      .then(setRecentEnrollments)
      .catch((e) => {
        console.error('Lỗi khi load Recent Enrollments:', e);
        setRecentEnrollments([]);
      });
  }, []);

  // Load Monthly Stats (chart)
  useEffect(() => {
    fetchMonthlyStats()
      .then(setChartData)
      .catch((e) => {
        console.error('Lỗi khi load Monthly Stats:', e);
        setChartData([]);
      });
  }, []);

  // Load Stats tổng
  useEffect(() => {
    fetchDashboardStats()
      .then(data => {
        setDashboardStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi load thống kê dashboard:', err);
        setLoading(false);
      });
  }, []);

  // ❌ TUYỆT ĐỐI không đặt hook mới dưới này trước when-return
  // monthLabel chỉ là biến thường (không phải hook) → an toàn
  const monthLabel = topMonths === 12 ? '12M' : `${topMonths}M`;

  // Early return an toàn vì KHÔNG có hook nào phía dưới bị phụ thuộc
  if (loading || !dashboardStats) {
    return <div className="text-center py-10 text-gray-500">Đang tải thống kê...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <button className="btn-secondary">Export Data</button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={dashboardStats.totalCourses}
          change={dashboardStats.courseGrowth ?? 0}
          changeType="increase"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          change={dashboardStats.userGrowth ?? 0}
          changeType="increase"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Total Instructors"
          value={dashboardStats.totalInstructors}
          change={dashboardStats.instructorGrowth ?? 0}
          changeType="increase"
          icon={UserCheck}
          color="purple"
        />
        <StatsCard
          title="Total Revenue"
          value={dashboardStats.totalRevenue.toLocaleString()} 
          change={dashboardStats.revenueGrowth ?? 0}
          changeType="increase"
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Enrollment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="courses" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity + Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h3>
          <div className="space-y-3">
            {recentEnrollments.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{item.userName?.charAt(0) ?? '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.userName} enrolled in {item.courseTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.enrolledAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performing Courses <span className="ml-2 text-sm text-gray-500">({monthLabel})</span>
            </h3>

            <div className="flex items-center gap-2">
              {/* sortBy */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring"
                aria-label="Sắp xếp theo"
              >
                <option value="enrollments">Enrollments</option>
                <option value="rating">Rating</option>
                <option value="active">Active learners</option>
                <option value="reviews">Reviews</option>
              </select>

              {/* months */}
              <select
                value={topMonths}
                onChange={(e) => setTopMonths(Number(e.target.value))}
                className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring"
                aria-label="Chọn khoảng thời gian"
              >
                <option value={1}>1 tháng</option>
                <option value={3}>3 tháng</option>
                <option value={6}>6 tháng</option>
                <option value={12}>1 năm</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {topLoading && (
              <div className="text-sm text-gray-500">Đang tải Top Courses...</div>
            )}

            {!topLoading && topCourses.length === 0 && (
              <div className="text-sm text-gray-500">Không có dữ liệu trong khoảng thời gian đã chọn.</div>
            )}

            {!topLoading && topCourses.map((course, index) => (
              <div
                key={course.courseId ?? index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{course.title}</p>
                  <p className="text-xs text-gray-500">
                    {course.enrollments?.toLocaleString('vi-VN')} enrollments
                    {typeof course.activeLearners === 'number' && (
                      <> · {course.activeLearners?.toLocaleString('vi-VN')} active</>
                    )}
                    {typeof course.reviewCount === 'number' && (
                      <> · {course.reviewCount?.toLocaleString('vi-VN')} reviews</>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">
                    {Number(course.avgRating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
