import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import { Users, BookOpen, DollarSign, TrendingUp, Download } from 'lucide-react';
import { fetchAnalyticsStats, fetchMonthlyBreakdown, fetchCategoryStats } from '../API/dashboardApi';
import PDFExport from '../components/PDFExport';
import * as htmlToImage from 'html-to-image';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '30':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '180':
          startDate.setDate(endDate.getDate() - 180);
          break;
        case '365':
          startDate.setDate(endDate.getDate() - 365);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch analytics stats, monthly breakdown, and category stats
      const [analyticsData, monthlyData, categoryData] = await Promise.all([
        fetchAnalyticsStats(
          startDate.toISOString(),
          endDate.toISOString()
        ),
        fetchMonthlyBreakdown(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        fetchCategoryStats(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      ]);
      
      setAnalyticsData(analyticsData);
      setMonthlyData(monthlyData);
      setCategoryData(categoryData);
      
             // Debug logging
       console.log('Analytics Data from API:', analyticsData);
       console.log('Monthly Data from API:', monthlyData);
       console.log('Category Data from API:', categoryData);
       console.log('Filtered Category Data:', categoryData.filter(item => item.value > 0));
       console.log('Monthly Data length:', monthlyData?.length);
       console.log('Monthly Data has valid values:', monthlyData?.some(item => item.revenue > 0 || item.users > 0));
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const processChartData = (data) => {
    console.log('Processing chart data:', data);
    
    if (!data || data.length === 0) {
      console.log('No data available');
      return [];
    }
    
    // Ensure data has required fields
    const processedData = data.map(item => ({
      month: item.month || item.name || 'Unknown',
      revenue: item.revenue || item.value || 0,
      users: item.users || item.count || 0
    }));
    
    console.log('Processed chart data:', processedData);
    return processedData;
  };

// Analytics.jsx
const exportToPDF = async () => {
  try {
    setExporting(true);

    /* 1. Tạo vùng A4 ẩn NHƯNG vẫn nằm trong viewport
       - để Recharts đo được width thật
       - opacity:0 → user không thấy  */
    const mm2px = (mm) => (mm * 96) / 25.4;          // 1in = 25.4 mm, 1in = 96 px
    const temp     = document.createElement('div');
    temp.style.position       = 'fixed';
    temp.style.inset          = '0';                 // top-0 right-0 bottom-0 left-0
    temp.style.width          = `${mm2px(210)}px`;   // 210 mm ≈ 794 px
    temp.style.minHeight      = `${mm2px(297)}px`;   // 297 mm ≈ 1123 px
    // temp.style.opacity        = '0';                 // ẩn
    temp.style.pointerEvents  = 'none';
    temp.style.zIndex         = '-1';
    document.body.appendChild(temp);

    /* 2. Render báo cáo (isPdf = true) */
    const root = ReactDOM.createRoot(temp);
    root.render(
      <PDFExport
        analyticsData={analyticsData}
        monthlyData={monthlyData}
        categoryData={categoryData}
        dateRange={dateRange}
        isPdf={true}
      />
    );

    /* 3. Đợi 2 frame để ResizeObserver + chart vẽ xong */
    await new Promise(r => requestAnimationFrame(() =>
      requestAnimationFrame(r)
    ));

    const dataUrl = await htmlToImage.toPng(temp, {
      pixelRatio: 1.5,
      backgroundColor: '#fff',
    });

    // 5. Cleanup
    root.unmount();
    document.body.removeChild(temp);

    // 6. Đưa vào jsPDF (KHÔNG lặp addPage)
    const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'p' });
    const { width: pdfW, height: pdfH } = pdf.internal.pageSize;

    const img = new window.Image();
    img.src = dataUrl;
    await img.decode();

    // Tính kích thước ảnh cho vừa A4, lề 10mm mỗi bên
    const imgW = pdfW - 20; // trừ 10mm lề mỗi bên
    const imgH = (img.height * imgW) / img.width;

    // Nếu ảnh quá cao thì cũng chỉ addImage 1 lần (nếu vượt thì ảnh sẽ tự co vào trong trang)
    pdf.addImage(dataUrl, 'PNG', 10, 0, imgW, imgH, undefined, 'FAST');
    pdf.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error(err);
    alert('Xuất PDF thất bại!');
  } finally {
    setExporting(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={contentRef}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                 <div className="flex space-x-3">
           <select 
             className="input w-auto"
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
           >
             <option value="30">Last 30 days</option>
             <option value="90">Last 3 months</option>
             <option value="180">Last 6 months</option>
             <option value="365">Last year</option>
           </select>
           
           <button 
             className={`btn-primary flex items-center space-x-2 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
             onClick={exportToPDF}
             disabled={exporting}
           >
             <Download size={16} />
             <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
           </button>
         </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={analyticsData ? formatCurrency(analyticsData.totalRevenue) : '$0'}
          change={analyticsData?.revenueGrowthPercent || 0}
          changeType={analyticsData?.revenueGrowthPercent >= 0 ? "increase" : "decrease"}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Enrollments"
          value={analyticsData ? formatNumber(analyticsData.totalEnrollments) : '0'}
          change={analyticsData?.enrollmentGrowthPercent || 0}
          changeType={analyticsData?.enrollmentGrowthPercent >= 0 ? "increase" : "decrease"}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Average Rating"
          value={analyticsData ? analyticsData.averageRating.toFixed(1) : '0.0'}
          change={analyticsData?.ratingGrowthPercent || 0}
          changeType={analyticsData?.ratingGrowthPercent >= 0 ? "increase" : "decrease"}
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Growth Overview"
          value={`${analyticsData?.revenueGrowthPercent >= 0 ? '+' : ''}${analyticsData?.revenueGrowthPercent?.toFixed(1) || 0}%`}
          change={analyticsData?.revenueGrowthPercent || 0}
          changeType={analyticsData?.revenueGrowthPercent >= 0 ? "increase" : "decrease"}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="card">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
           <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={processChartData(monthlyData)}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="month" />
                                <YAxis 
                   tickFormatter={(value) => {
                     if (value >= 1000000) {
                       return `$${(value / 1000000).toFixed(1)}M`;
                     } else if (value >= 1000) {
                       return `$${(value / 1000).toFixed(0)}K`;
                     }
                     return `$${value}`;
                   }}
                   width={120}
                   tick={{ fontSize: 11 }}
                   axisLine={false}
                   tickLine={false}
                 />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

                 <div className="card">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
           <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={processChartData(monthlyData)}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="month" />
                                <YAxis 
                   tickFormatter={(value) => {
                     if (value >= 1000000) {
                       return `${(value / 1000000).toFixed(1)}M`;
                     } else if (value >= 1000) {
                       return `${(value / 1000).toFixed(0)}K`;
                     }
                     return value;
                   }}
                   width={100}
                   tick={{ fontSize: 11 }}
                   axisLine={false}
                   tickLine={false}
                 />
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Users']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Categories Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            {categoryData && categoryData.length > 0 && categoryData.filter(item => item.value > 0).length > 0 ? (
              <PieChart>
                <Pie
                  data={categoryData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={30}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No category data available</p>
                  <p className="text-gray-400 text-sm">Try selecting a different date range</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Revenue Growth</p>
                <p className="text-sm text-gray-500">Percentage change in revenue</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.revenueGrowthPercent >= 0 ? '+' : ''}{analyticsData?.revenueGrowthPercent?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-500">vs previous period</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enrollment Growth</p>
                <p className="text-sm text-gray-500">Percentage change in enrollments</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.enrollmentGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.enrollmentGrowthPercent >= 0 ? '+' : ''}{analyticsData?.enrollmentGrowthPercent?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-500">vs previous period</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rating Growth</p>
                <p className="text-sm text-gray-500">Percentage change in average rating</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.ratingGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.ratingGrowthPercent >= 0 ? '+' : ''}{analyticsData?.ratingGrowthPercent?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-500">vs previous period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;