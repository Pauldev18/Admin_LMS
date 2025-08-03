import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";

/**
 * @param {Object} props
 * @param {AnalyticsStats}   props.analyticsData  – Các chỉ số tổng hợp
 * @param {MonthlyBreakdown[]} props.monthlyData   – Dữ liệu từng tháng (month, revenue, users ...)
 * @param {CategoryStat[]}   props.categoryData   – Thống kê category (name, value, color)
 * @param {string}           props.dateRange      – 30 | 90 | 180 | 365
 * @param {boolean}          props.isPdf          – true khi render để xuất PDF (tắt animation)
 */
const PDFExport = ({
  analyticsData,
  monthlyData,
  categoryData,
  dateRange,
  isPdf = false,
}) => {
  /******************** Helpers ********************/
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

  const processChartData = (data) =>
    (data || []).map((item) => ({
      month: item.month || item.name || "Unknown",
      revenue: item.revenue ?? item.value ?? 0,
      users: item.users ?? item.count ?? 0,
    }));

  const getDateRangeText = () => {
    switch (dateRange) {
      case "30":
        return "Last 30 days";
      case "90":
        return "Last 3 months";
      case "180":
        return "Last 6 months";
      case "365":
        return "Last year";
      default:
        return "Last 30 days";
    }
  };

  /**
   * Props chung để tắt animation khi export PDF
   */
  const anim = isPdf ? { isAnimationActive: false, animationDuration: 0 } : {};

  /******************** JSX ********************/
  return (
    <div
      className="pdf-container"
      style={{
        width: isPdf ? "210mm" : "100%", // full A4 khi export
        padding: isPdf ? "15mm" : "20mm", // reduced padding when export
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        color: "#000000",
        minHeight: isPdf ? "297mm" : "auto", // A4 height
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          borderBottom: "2px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            margin: "0 0 5px 0",
            color: "#333",
          }}
        >
          Analytics Report
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
          {getDateRangeText()} • Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        {/** Total Revenue */}
        <MetricCard
          icon={<DollarSign size={16} color="#10b981" />}
          title="Total Revenue"
          value={analyticsData ? formatCurrency(analyticsData.totalRevenue) : "$0"}
          change={analyticsData?.revenueGrowthPercent ?? 0}
          color="#10b981"
        />

        {/** Total Enrollments */}
        <MetricCard
          icon={<Users size={16} color="#3b82f6" />}
          title="Total Enrollments"
          value={analyticsData ? formatNumber(analyticsData.totalEnrollments) : "0"}
          change={analyticsData?.enrollmentGrowthPercent ?? 0}
          color="#3b82f6"
        />

        {/** Average Rating */}
        <MetricCard
          icon={<BookOpen size={16} color="#8b5cf6" />}
          title="Average Rating"
          value={analyticsData ? analyticsData.averageRating.toFixed(1) : "0.0"}
          change={analyticsData?.ratingGrowthPercent ?? 0}
          color="#8b5cf6"
        />

        {/** Growth Overview */}
        <MetricCard
          icon={<TrendingUp size={16} color="#f59e0b" />}
          title="Growth Overview"
          value={`${analyticsData?.revenueGrowthPercent >= 0 ? "+" : ""}${
            (analyticsData?.revenueGrowthPercent ?? 0).toFixed(1)
          }%`}
          change={analyticsData?.revenueGrowthPercent ?? 0}
          color="#f59e0b"
        />
      </div>

      {/******** Revenue & User Trends ********/}
      <SectionTitle>Revenue & User Trends</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={processChartData(monthlyData)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`
                }
                width={80}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
                labelFormatter={(l) => `Month: ${l}`}
                contentStyle={{ fontSize: '10px', border: '1px solid #ccc' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                {...anim}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processChartData(monthlyData)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v
                }
                width={60}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(v) => [v.toLocaleString(), "Users"]} 
                labelFormatter={(l) => `Month: ${l}`}
                contentStyle={{ fontSize: '10px', border: '1px solid #ccc' }}
              />
              <Bar dataKey="users" fill="#3b82f6" {...anim} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/******** Categories & Growth ********/}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}
      >
        {/* Category Pie */}
        <ChartCard title="Course Categories Distribution">
          <ResponsiveContainer width="100%" height={250}>
            {categoryData?.some((i) => i.value > 0) ? (
              <PieChart>
                <Pie
                  data={categoryData.filter((i) => i.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={25}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                  {...anim}
                >
                  {categoryData
                    .filter((i) => i.value > 0)
                    .map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.color || `hsl(${idx * 60}, 70%, 50%)`}
                      />
                    ))}
                </Pie>
                <Tooltip 
                  formatter={(v, n) => [v, n]} 
                  contentStyle={{ fontSize: '10px', border: '1px solid #ccc' }}
                />
              </PieChart>
            ) : (
              <EmptyChartPlaceholder>No category data</EmptyChartPlaceholder>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Growth Metrics */}
        <ChartCard title="Growth Metrics">
          <GrowthItem
            label="Revenue Growth"
            value={analyticsData?.revenueGrowthPercent ?? 0}
          />
          <GrowthItem
            label="Enrollment Growth"
            value={analyticsData?.enrollmentGrowthPercent ?? 0}
          />
          <GrowthItem label="Rating Growth" value={analyticsData?.ratingGrowthPercent ?? 0} />
        </ChartCard>
      </div>
    </div>
  );
};

/******************** Sub-Components ********************/
const MetricCard = ({ icon, title, value, change, color }) => (
  <div
    style={{
      padding: 15,
      border: "1px solid #ddd",
      borderRadius: 8,
      backgroundColor: "#f9f9f9",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      {icon}
      <span style={{ fontWeight: "bold", fontSize: 14, marginLeft: 8 }}>{title}</span>
    </div>
    <div style={{ fontSize: 18, fontWeight: "bold", color }}>{value}</div>
    <div style={{ fontSize: 12, color: "#666" }}>
      {change >= 0 ? "+" : ""}
      {change.toFixed(1)}% from previous period
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 15,
      backgroundColor: "#fff",
    }}
  >
    <h3 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>{title}</h3>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#333" }}>
    {children}
  </h2>
);

const GrowthItem = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: 8,
      backgroundColor: "#f9f9f9",
      borderRadius: 4,
      marginBottom: 10,
    }}
  >
    <span style={{ fontSize: 12, fontWeight: "bold" }}>{label}</span>
    <span
      style={{
        fontSize: 12,
        fontWeight: "bold",
        color: value >= 0 ? "#10b981" : "#ef4444",
      }}
    >
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  </div>
);

const EmptyChartPlaceholder = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#666",
      fontSize: 12,
    }}
  >
    {children}
  </div>
);

export default PDFExport;