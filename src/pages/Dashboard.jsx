import { Users, BookOpen, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import { dashboardStats } from '../data/mockData';

const chartData = [
  { name: 'Jan', users: 400, revenue: 2400, courses: 24 },
  { name: 'Feb', users: 300, revenue: 1398, courses: 28 },
  { name: 'Mar', users: 200, revenue: 9800, courses: 32 },
  { name: 'Apr', users: 278, revenue: 3908, courses: 35 },
  { name: 'May', users: 189, revenue: 4800, courses: 38 },
  { name: 'Jun', users: 239, revenue: 3800, courses: 42 },
];

const Dashboard = () => {
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
          change={dashboardStats.courseGrowth}
          changeType="increase"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          change={dashboardStats.userGrowth}
          changeType="increase"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Total Instructors"
          value={dashboardStats.totalInstructors}
          change={dashboardStats.instructorGrowth}
          changeType="increase"
          icon={UserCheck}
          color="purple"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(dashboardStats.totalRevenue / 1000).toFixed(0)}k`}
          change={dashboardStats.revenueGrowth}
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
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">A{item}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Student {item} enrolled in React Course</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="space-y-3">
            {[
              { title: 'Complete React Development', students: 1250, rating: 4.8 },
              { title: 'Advanced JavaScript', students: 890, rating: 4.9 },
              { title: 'Python for Data Science', students: 756, rating: 4.7 },
              { title: 'UI/UX Design Basics', students: 456, rating: 4.6 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{course.title}</p>
                  <p className="text-xs text-gray-500">{course.students} students</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{course.rating}</span>
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