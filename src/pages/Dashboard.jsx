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
import { fetchDashboardStats, fetchMonthlyStats, fetchRecentEnrollments, fetchTopCourses } from '../API/dashboardApi';



const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
const [chartData, setChartData] = useState([]);
const [recentEnrollments, setRecentEnrollments] = useState([]);
const [topCourses, setTopCourses] = useState([]);

useEffect(() => {
  fetchTopCourses().then(setTopCourses);
}, []);


useEffect(() => {
  fetchRecentEnrollments().then(setRecentEnrollments);
}, []);

useEffect(() => {
  fetchMonthlyStats().then(setChartData);
}, []);


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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h3>
          <div className="space-y-3">
            {recentEnrollments.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{item.userName.charAt(0)}</span>
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


       <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h3>
        <div className="space-y-3">
          {topCourses.map((course, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{course.title}</p>
                <p className="text-xs text-gray-500">{course.students} students</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
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
