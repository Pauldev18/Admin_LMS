import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import { Users, BookOpen, DollarSign, TrendingUp, Download, Filter } from 'lucide-react';
import { fetchAnalyticsStats, fetchMonthlyBreakdown, fetchCategoryStats } from '../API/dashboardApi';
import PDFExport from '../components/PDFExport';
import * as htmlToImage from 'html-to-image';

/* --------- Helpers (local YYYY-MM-DD & clamp) --------- */
const toYMD = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const todayYMD = () => toYMD(new Date());
const daysAgoYMD = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toYMD(d);
};
const clampToToday = (d) => (d > new Date() ? new Date() : d);

/* ================== PAGE ================== */
const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // '30' | '90' | '180' | '365' | 'custom'
  const [dateRange, setDateRange] = useState('30');

  // Chỉ dùng khi custom
  const [fromDate, setFromDate] = useState(daysAgoYMD(30));
  const [toDate, setToDate] = useState(todayYMD());

  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  /* ----- Fetch cho preset (không fetch khi custom) ----- */
  useEffect(() => {
    if (dateRange === 'custom') return;
    (async () => {
      const end = new Date();
      const start = new Date(end);
      switch (dateRange) {
        case '90':  start.setDate(end.getDate() - 90);  break;
        case '180': start.setDate(end.getDate() - 180); break;
        case '365': start.setDate(end.getDate() - 365); break;
        default:    start.setDate(end.getDate() - 30);
      }
      await fetchDataWithRange(start, end);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  /* ----- Hàm fetch chung theo start/end (Date objects) ----- */
  const fetchDataWithRange = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const end = clampToToday(endDate);
      const start = startDate;

      const [aData, mData, cData] = await Promise.all([
        fetchAnalyticsStats(start.toISOString(), end.toISOString()),
        fetchMonthlyBreakdown(toYMD(start), toYMD(end)),
        fetchCategoryStats(toYMD(start), toYMD(end)),
      ]);

      setAnalyticsData(aData);
      setMonthlyData(mData);
      setCategoryData(cData);

      // Debug
      console.log('[Analytics] range:', start, '->', end);
      console.log('Analytics Data:', aData);
      console.log('Monthly Data:', mData);
      console.log('Category Data:', cData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  /* ----- Lọc cho custom ----- */
  const handleFilterClick = async () => {
    if (!fromDate || !toDate) return alert('Vui lòng chọn đủ Từ ngày và Đến ngày');
    const s = new Date(`${fromDate}T00:00:00`);
    const e = new Date(`${toDate}T23:59:59`);
    if (e < s) return alert('Khoảng thời gian không hợp lệ: Đến ngày phải ≥ Từ ngày');
    setDateRange('custom'); // đảm bảo trạng thái
    await fetchDataWithRange(s, e);
  };

  /* ----- Formatters ----- */
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatNumber = (number) => new Intl.NumberFormat('en-US').format(number || 0);

  const processChartData = (data) => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      month: item.month || item.name || 'Unknown',
      revenue: item.revenue ?? item.value ?? 0,
      users: item.users ?? item.count ?? 0,
    }));
  };

  /* ----- Export PDF (dùng state hiện tại) ----- */
  const exportToPDF = async () => {
    try {
      setExporting(true);

      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.inset = '0';
      temp.style.width = `${(210 * 96) / 25.4}px`; // A4 width px
      temp.style.minHeight = `${(297 * 96) / 25.4}px`; // A4 height px
      temp.style.pointerEvents = 'none';
      temp.style.zIndex = '-1';
      document.body.appendChild(temp);

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

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const dataUrl = await htmlToImage.toPng(temp, { pixelRatio: 1.5, backgroundColor: '#fff' });

      root.unmount();
      document.body.removeChild(temp);

      const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'p' });
      const { width: pdfW } = pdf.internal.pageSize;

      const img = new window.Image();
      img.src = dataUrl;
      await img.decode();

      const imgW = pdfW - 20; // lề 10mm
      const imgH = (img.height * imgW) / img.width;

      pdf.addImage(dataUrl, 'PNG', 10, 0, imgW, imgH, undefined, 'FAST');
      pdf.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Xuất PDF thất bại!');
    } finally {
      setExporting(false);
    }
  };

  /* ----- Loading / Error ----- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
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

  /* ----- UI ----- */
  return (
    <div className="space-y-6" ref={contentRef}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-900">Phân tích/Thống kê</h1>

        {/* Khối filter + action */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Preset nhanh */}
          <select
            className="input w-auto"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="30">30 ngày qua</option>
            <option value="90">3 tháng qua</option>
            <option value="180">6 tháng qua</option>
            <option value="365">1 năm qua</option>
            <option value="custom">Tùy chọn…</option>
          </select>

          {/* Nhóm custom chỉ hiện khi chọn Tùy chọn */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Từ ngày</label>
              <input
                type="date"
                className="input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={todayYMD()}
              />
              <label className="text-sm text-gray-600">Đến ngày</label>
              <input
                type="date"
                className="input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                max={todayYMD()}
              />
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleFilterClick}
                title="Lọc theo khoảng ngày"
                disabled={!fromDate || !toDate}
              >
                <Filter size={16} />
                Lọc
              </button>
            </div>
          )}

          {/* Nút xuất PDF – luôn thẳng hàng, không bị “xấu” */}
          <button
            className={`btn-primary flex items-center gap-2 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={exportToPDF}
            disabled={exporting}
          >
            <Download size={16} />
            <span>{exporting ? 'Đang xuất...' : 'Xuất PDF'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(analyticsData?.totalRevenue)}
          change={analyticsData?.revenueGrowthPercent || 0}
          changeType={analyticsData?.revenueGrowthPercent >= 0 ? 'increase' : 'decrease'}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Tổng số học viên"
          value={formatNumber(analyticsData?.totalEnrollments)}
          change={analyticsData?.enrollmentGrowthPercent || 0}
          changeType={analyticsData?.enrollmentGrowthPercent >= 0 ? 'increase' : 'decrease'}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Đánh giá trung bình"
          value={(analyticsData?.averageRating ?? 0).toFixed(1)}
          change={analyticsData?.ratingGrowthPercent || 0}
          changeType={analyticsData?.ratingGrowthPercent >= 0 ? 'increase' : 'decrease'}
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Tổng quan về tăng trưởng"
          value={`${analyticsData?.revenueGrowthPercent >= 0 ? '+' : ''}${(analyticsData?.revenueGrowthPercent ?? 0).toFixed(1)}%`}
          change={analyticsData?.revenueGrowthPercent || 0}
          changeType={analyticsData?.revenueGrowthPercent >= 0 ? 'increase' : 'decrease'}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng doanh thu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processChartData(monthlyData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
                  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
                  return `$${value}`;
                }}
                width={120}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tăng trưởng người dùng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processChartData(monthlyData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                  return value;
                }}
                width={100}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), 'Users']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ danh mục khóa học</h3>
          <ResponsiveContainer width="100%" height={300}>
            {categoryData && categoryData.filter((i) => i.value > 0).length > 0 ? (
              <PieChart>
                <Pie
                  data={categoryData.filter((i) => i.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={30}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData
                    .filter((i) => i.value > 0)
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} labelFormatter={(label) => `Category: ${label}`} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">Không có dữ liệu danh mục</p>
                  <p className="text-gray-400 text-sm">Hãy thử chọn một phạm vi ngày khác</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Số liệu tăng trưởng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Tăng trưởng doanh thu</p>
                <p className="text-sm text-gray-500">Tỷ lệ thay đổi doanh thu</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.revenueGrowthPercent >= 0 ? '+' : ''}
                  {(analyticsData?.revenueGrowthPercent ?? 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">so với kỳ trước</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Tăng trưởng tuyển sinh</p>
                <p className="text-sm text-gray-500">Tỷ lệ thay đổi trong tuyển sinh</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.enrollmentGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.enrollmentGrowthPercent >= 0 ? '+' : ''}
                  {(analyticsData?.enrollmentGrowthPercent ?? 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">so với kỳ trước</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Xếp hạng tăng trưởng</p>
                <p className="text-sm text-gray-500">Tỷ lệ % thay đổi xếp hạng trung bình</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${analyticsData?.ratingGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.ratingGrowthPercent >= 0 ? '+' : ''}
                  {(analyticsData?.ratingGrowthPercent ?? 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">so với kỳ trước</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
