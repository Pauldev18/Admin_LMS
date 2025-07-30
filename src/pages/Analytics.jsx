import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 12000, courses: 15, users: 234 },
  { month: 'Feb', revenue: 15000, courses: 18, users: 345 },
  { month: 'Mar', revenue: 18000, courses: 22, users: 456 },
  { month: 'Apr', revenue: 22000, courses: 28, users: 567 },
  { month: 'May', revenue: 25000, courses: 32, users: 678 },
  { month: 'Jun', revenue: 28000, courses: 35, users: 789 },
];

const categoryData = [
  { name: 'Web Development', value: 35, color: '#3b82f6' },
  { name: 'Programming', value: 25, color: '#10b981' },
  { name: 'Design', value: 20, color: '#f59e0b' },
  { name: 'Data Science', value: 15, color: '#ef4444' },
  { name: 'Mobile Dev', value: 5, color: '#8b5cf6' },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-3">
          <select className="input w-auto">
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <button className="btn-primary">Export Report</button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Revenue"
          value="$28,500"
          change={18.2}
          changeType="increase"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="New Enrollments"
          value="1,247"
          change={12.5}
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Course Completion"
          value="89.2%"
          change={5.1}
          changeType="increase"
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Avg. Course Rating"
          value="4.8"
          change={2.3}
          changeType="increase"
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Categories Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Average Session Duration</p>
                <p className="text-sm text-gray-500">Time spent per learning session</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">24m 32s</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Course Completion Rate</p>
                <p className="text-sm text-gray-500">Students completing courses</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">87.4%</p>
                <p className="text-sm text-green-600">+5.2% from last month</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Monthly Active Users</p>
                <p className="text-sm text-gray-500">Active learners this month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">2,847</p>
                <p className="text-sm text-green-600">+8.3% from last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;