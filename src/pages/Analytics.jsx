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

  const exportToPDF = async () => {
    try {
      setExporting(true);
      console.log('Starting PDF export...');

      // Wait for any pending animations or renders to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const mm2px = (mm) => (mm * 96) / 25.4;
      const temp = document.createElement('div');
      
      // Make it visible but positioned off-screen for better rendering
      temp.style.position = 'absolute';
      temp.style.top = '-9999px';
      temp.style.left = '0';
      temp.style.width = `${mm2px(210)}px`;
      temp.style.minHeight = `${mm2px(297)}px`;
      temp.style.backgroundColor = '#ffffff';
      temp.style.overflow = 'visible';
      temp.id = 'pdf-export-container';
      
      document.body.appendChild(temp);

      // Create React root and render
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

      // Wait for React to render and charts to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Wait for all SVG elements (charts) to be rendered
      await new Promise(resolve => {
        const checkCharts = () => {
          const svgs = temp.querySelectorAll('svg');
          const rects = temp.querySelectorAll('svg rect, svg path, svg circle');
          
          console.log(`Found ${svgs.length} SVG elements, ${rects.length} chart elements`);
          
          if (svgs.length > 0 && rects.length > 0) {
            console.log('Charts detected, proceeding with capture');
            setTimeout(resolve, 500); // Additional buffer
          } else {
            console.log('Waiting for charts to render...');
            setTimeout(checkCharts, 200);
          }
        };
        checkCharts();
      });

      console.log('Capturing image...');
      
      // Capture with optimized settings
      const dataUrl = await htmlToImage.toPng(temp, {
        pixelRatio: 1.5, // Reduced from 2 to decrease file size
        backgroundColor: '#ffffff',
        quality: 0.8,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // Important for SVG charts
        width: mm2px(210),
        height: temp.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      console.log('Image captured, cleaning up...');

      // Clean up
      root.unmount();
      document.body.removeChild(temp);

      // Create PDF
      const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
      const pdf = new jsPDF({ 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true // Enable compression
      });
      
      const { width: pdfW, height: pdfH } = pdf.internal.pageSize;

      // Load and process image
      const img = new Image();
      img.src = dataUrl;
      await img.decode();

      const imgW = pdfW;
      const imgH = (img.height * imgW) / img.width;

      console.log(`Image dimensions: ${img.width}x${img.height}`);
      console.log(`PDF dimensions: ${imgW}x${imgH}mm`);

      // Add image to PDF with proper scaling
      let currentY = 0;
      let remainingHeight = imgH;

      // First page
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgW, Math.min(imgH, pdfH), undefined, 'FAST');
      remainingHeight -= pdfH;

      // Additional pages if needed
      while (remainingHeight > 0) {
        currentY -= pdfH;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, currentY, imgW, imgH, undefined, 'FAST');
        remainingHeight -= pdfH;
      }

      // Save with date
      const filename = `analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      
      console.log('PDF export completed successfully');
      
    } catch (err) {
      console.error('PDF export error:', err);
      alert(`PDF export failed: ${err.message}`);
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