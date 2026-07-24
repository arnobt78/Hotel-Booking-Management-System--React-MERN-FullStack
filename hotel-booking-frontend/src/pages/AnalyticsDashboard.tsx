import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import {
  fetchBusinessInsightsDashboard,
  fetchBusinessInsightsForecast,
  fetchBusinessInsightsSystemStats,
} from "../api-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  RefreshCw,
  Server,
  Clock,
  AlertCircle,
  Loader2,
  Ban,
  Receipt,
  Star,
  Sparkles,
  MapPin,
  Hotel,
  Database,
  LineChart as LineChartIcon,
  ShieldCheck,
  BedDouble,
  CreditCard,
  UserRound,
  BadgeCheck,
} from "lucide-react";
import { InsightsCardHeader } from "../components/insights/InsightsCardHeader";
import {
  MetricStatCard,
  toneFromNumber,
  toneFromTrend,
} from "../components/insights/MetricStatCard";

interface AnalyticsData {
  overview: {
    totalHotels: number;
    totalUsers: number;
    totalBookings: number;
    recentBookings: number;
    totalRevenue: number;
    recentRevenue: number;
    revenueGrowth: number;
    cancelledBookings?: number;
    confirmedBookings?: number;
    pendingBookings?: number;
    refundedBookings?: number;
    totalRefundAmount?: number;
    cancellationRate?: number;
    totalReviews?: number;
    avgReviewRating?: number;
    avgLos?: number;
    adr?: number;
    avgPartySize?: number;
    verifiedReviewCount?: number;
  };
  popularDestinations: Array<{
    _id: string;
    count: number;
    avgPrice: number;
    totalRevenue?: number;
  }>;
  dailyBookings: Array<{
    date: string;
    bookings: number;
  }>;
  hotelPerformance: Array<{
    _id?: string;
    name: string;
    city: string;
    starRating: number;
    pricePerNight: number;
    bookingCount: number;
    totalRevenue: number;
  }>;
  bookingStatusBreakdown?: Array<{ status: string; count: number }>;
  paymentStatusBreakdown?: Array<{ status: string; count: number }>;
  guestMix?: { adults: number; children: number };
  reviewCategoryAverages?: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
  hotelsByStar?: Array<{ starRating: number; count: number }>;
  lastUpdated: string;
}

interface ForecastData {
  historical: Array<{
    week: string;
    bookings: number;
    revenue: number;
  }>;
  forecasts: Array<{
    week: string;
    bookings: number;
    revenue: number;
    confidence: number;
  }>;
  seasonalGrowth: number;
  trends: {
    bookingTrend: string;
    revenueTrend: string;
  };
  lastUpdated: string;
}

interface OpsStatusData {
  system?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
  database: {
    collections?: number;
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
  };
  application: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    uptime: string;
    todayBookings: number;
    thisWeekBookings: number;
  };
  lastUpdated: string;
}

type TabId = "overview" | "forecast" | "ops" | "quality";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const QUERY_OPTS = {
  refetchInterval: false as const,
  retry: 3,
  retryDelay: 1000,
  keepPreviousData: true,
};

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: analyticsData,
    isLoading,
    isFetching: dashboardFetching,
    error,
    refetch,
  } = useQueryWithLoading<AnalyticsData>(
    "business-insights-dashboard",
    fetchBusinessInsightsDashboard,
    QUERY_OPTS,
  );

  const {
    data: forecastData,
    isLoading: forecastLoading,
    isFetching: forecastFetching,
    refetch: refetchForecast,
  } = useQueryWithLoading<ForecastData>(
    "business-insights-forecast",
    fetchBusinessInsightsForecast,
    QUERY_OPTS,
  );

  const {
    data: opsData,
    isLoading: opsLoading,
    isFetching: opsFetching,
    refetch: refetchOps,
  } = useQueryWithLoading<OpsStatusData>(
    "business-insights-ops",
    fetchBusinessInsightsSystemStats,
    QUERY_OPTS,
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchForecast(), refetchOps()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshing =
    isRefreshing || dashboardFetching || forecastFetching || opsFetching;

  const ov = analyticsData?.overview;
  const cancelRate = ov?.cancellationRate ?? 0;
  const avgConf = forecastData?.forecasts?.length
    ? forecastData.forecasts.reduce((s, f) => s + (f.confidence || 0), 0) /
      forecastData.forecasts.length
    : 0;

  const categoryRows = analyticsData?.reviewCategoryAverages
    ? Object.entries(analyticsData.reviewCategoryAverages).map(
        ([category, score]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          score,
        }),
      )
    : [];

  const topCategory =
    categoryRows.length > 0
      ? categoryRows.reduce((a, b) => (b.score > a.score ? b : a))
      : null;

  const statusChartData =
    analyticsData?.bookingStatusBreakdown?.map((r) => ({
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      count: r.count,
    })) ??
    (ov
      ? [
          { status: "Confirmed", count: ov.confirmedBookings ?? 0 },
          { status: "Pending", count: ov.pendingBookings ?? 0 },
          { status: "Cancelled", count: ov.cancelledBookings ?? 0 },
          { status: "Refunded", count: ov.refundedBookings ?? 0 },
        ]
      : []);

  const forecastTableRows = forecastData
    ? [
        ...forecastData.historical.map((h) => ({
          ...h,
          kind: "Historical" as const,
          confidence: null as number | null,
        })),
        ...forecastData.forecasts.map((f) => ({
          week: f.week,
          bookings: f.bookings,
          revenue: f.revenue,
          kind: "Forecast" as const,
          confidence: f.confidence,
        })),
      ]
    : [];

  const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "forecast", label: "Forecasting", icon: TrendingUp },
    { id: "quality", label: "Quality", icon: ShieldCheck },
    { id: "ops", label: "Ops status", icon: Activity },
  ];

  return (
    <div className="w-full min-h-0 space-y-6">
      {/* Page header — always visible (Vite shell) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-stretch gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary-100 px-3 text-primary-600">
            <BarChart3 className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-lg md:text-2xl font-medium text-gray-700 leading-tight">
              Business Insights Dashboard
            </h1>
            <p className="text-gray-600 text-sm font-normal ">
              Comprehensive insights into your hotel booking business
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {refreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-1 px-4 sm:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {error && activeTab === "overview" && !analyticsData && (
        <div className="bg-white rounded-xl shadow-xl border p-6 text-center">
          <p className="text-red-500 mb-4">
            Failed to load business insights data
          </p>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview — pulse only when no cached data */}
      {activeTab === "overview" && isLoading && !analyticsData && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse w-full" />
        </div>
      )}

      {activeTab === "overview" && analyticsData && ov && (
        <div
          className={`w-full space-y-8 ${
            dashboardFetching ? "opacity-90" : ""
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={Building}
              title="Total Hotels"
              subtitle="Listed properties"
              value={formatNumber(ov.totalHotels)}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={Users}
              title="Total Users"
              subtitle="Registered accounts"
              value={formatNumber(ov.totalUsers)}
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Calendar}
              title="Total Bookings"
              subtitle={`${formatNumber(ov.recentBookings)} last 30 days`}
              value={formatNumber(ov.totalBookings)}
              tone={toneFromNumber(ov.totalBookings)}
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={DollarSign}
              title="Total Revenue"
              subtitle="All-time booking value"
              value={formatCurrency(ov.totalRevenue)}
              tone={toneFromNumber(ov.totalRevenue)}
              iconClassName="bg-yellow-100 text-yellow-600"
              footer={
                <div className="flex items-center gap-1">
                  {ov.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      ov.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {ov.revenueGrowth.toFixed(1)}% MoM
                  </span>
                </div>
              }
            />
            <MetricStatCard
              icon={DollarSign}
              title="Recent Revenue"
              subtitle="Last 30 days"
              value={formatCurrency(ov.recentRevenue)}
              tone={toneFromNumber(ov.recentRevenue)}
              iconClassName="bg-lime-100 text-lime-700"
            />
            <MetricStatCard
              icon={BedDouble}
              title="Avg LOS"
              subtitle="Nights per booking"
              value={ov.avgLos ?? 0}
              tone={toneFromNumber(ov.avgLos ?? 0)}
              iconClassName="bg-sky-100 text-sky-600"
            />
            <MetricStatCard
              icon={CreditCard}
              title="ADR"
              subtitle="Revenue per room-night"
              value={formatCurrency(ov.adr ?? 0)}
              tone={toneFromNumber(ov.adr ?? 0)}
              iconClassName="bg-cyan-100 text-cyan-600"
            />
            <MetricStatCard
              icon={UserRound}
              title="Pending"
              subtitle={`Party avg ${ov.avgPartySize ?? 0}`}
              value={formatNumber(ov.pendingBookings ?? 0)}
              tone={toneFromNumber(ov.pendingBookings ?? 0, { invert: true })}
              iconClassName="bg-slate-100 text-slate-600"
            />
            <MetricStatCard
              icon={Ban}
              title="Cancelled"
              subtitle={`${cancelRate}% cancellation rate`}
              value={formatNumber(ov.cancelledBookings ?? 0)}
              tone={toneFromNumber(ov.cancelledBookings ?? 0, { invert: true })}
              iconClassName="bg-red-100 text-red-600"
            />
            <MetricStatCard
              icon={Receipt}
              title="Refunded"
              subtitle={formatCurrency(ov.totalRefundAmount ?? 0)}
              value={formatNumber(ov.refundedBookings ?? 0)}
              tone={toneFromNumber(ov.refundedBookings ?? 0, { invert: true })}
              iconClassName="bg-orange-100 text-orange-600"
            />
            <MetricStatCard
              icon={Star}
              title="Reviews"
              subtitle={`Avg ${ov.avgReviewRating ?? 0} ★`}
              value={formatNumber(ov.totalReviews ?? 0)}
              tone={toneFromNumber(ov.totalReviews ?? 0)}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="Confirmed"
              subtitle={`${formatNumber(ov.verifiedReviewCount ?? 0)} verified reviews`}
              value={formatNumber(ov.confirmedBookings ?? 0)}
              tone={toneFromNumber(ov.confirmedBookings ?? 0)}
              iconClassName="bg-teal-100 text-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Calendar}
                title="Daily Bookings"
                subtitle="Recent booking volume by day"
                iconClassName="bg-blue-100 text-blue-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Bookings"]}
                  />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="bookings"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={MapPin}
                title="Popular Destinations"
                subtitle="Share of bookings by city"
                iconClassName="bg-emerald-100 text-emerald-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.popularDestinations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent, count }) =>
                      `${_id} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.popularDestinations.map((_, index) => (
                      <Cell
                        key={`dest-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Bookings"]}
                    labelFormatter={(label) => String(label)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={CreditCard}
                title="Payment Status"
                subtitle="Paid / pending / failed / refunded"
                iconClassName="bg-violet-100 text-violet-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.paymentStatusBreakdown ?? []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent, count }) =>
                      `${status} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                    }
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(analyticsData.paymentStatusBreakdown ?? []).map(
                      (_, index) => (
                        <Cell
                          key={`pay-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Bookings"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={MapPin}
                title="Destination Revenue"
                subtitle="Bookings, revenue, and avg nightly price"
                iconClassName="bg-emerald-100 text-emerald-700"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["City", "Bookings", "Revenue", "Avg price"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.popularDestinations.map((dest) => (
                      <tr key={dest._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {dest._id}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            dest.count > 0 ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {dest.count}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            (dest.totalRevenue ?? 0) > 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {formatCurrency(dest.totalRevenue ?? 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(dest.avgPrice || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border p-6 w-full">
            <InsightsCardHeader
              icon={Hotel}
              title="Top Performing Hotels"
              subtitle="Ranked by booking count — click a name for details"
              iconClassName="bg-indigo-100 text-indigo-600"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Hotel",
                      "City",
                      "Rating",
                      "Price/Night",
                      "Bookings",
                      "Revenue",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.hotelPerformance.slice(0, 10).map((hotel) => (
                    <tr
                      key={String(hotel._id ?? hotel.name)}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                        {hotel._id ? (
                          <Link
                            to={`/detail/${hotel._id}`}
                            className="text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            {hotel.name}
                          </Link>
                        ) : (
                          <span className="text-gray-700">{hotel.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotel.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                        {hotel.starRating} ★
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(hotel.pricePerNight)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          hotel.bookingCount > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {hotel.bookingCount}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          hotel.totalRevenue > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(hotel.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "forecast" && forecastLoading && !forecastData && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {activeTab === "forecast" && forecastData && (
        <div
          className={`w-full space-y-8 ${forecastFetching ? "opacity-90" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={TrendingUp}
              title="Booking Trend"
              subtitle="Predicted direction"
              value={
                <span className="capitalize">
                  {forecastData.trends.bookingTrend}
                </span>
              }
              tone={toneFromTrend(forecastData.trends.bookingTrend)}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={DollarSign}
              title="Revenue Trend"
              subtitle="Predicted direction"
              value={
                <span className="capitalize">
                  {forecastData.trends.revenueTrend}
                </span>
              }
              tone={toneFromTrend(forecastData.trends.revenueTrend)}
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Activity}
              title="Seasonal Growth"
              subtitle="Modelled seasonality"
              value={`${forecastData.seasonalGrowth.toFixed(1)}%`}
              tone={toneFromNumber(forecastData.seasonalGrowth)}
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="AI Confidence"
              subtitle="Avg forecast confidence"
              value={`${(avgConf * 100).toFixed(0)}%`}
              tone={
                avgConf >= 0.6
                  ? "positive"
                  : avgConf >= 0.4
                    ? "warning"
                    : "negative"
              }
              iconClassName="bg-violet-100 text-violet-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={LineChartIcon}
                title="Booking Forecast"
                subtitle="Historical + projected weekly bookings"
                iconClassName="bg-blue-100 text-blue-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[...forecastData.historical, ...forecastData.forecasts]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Bookings"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  >
                    <LabelList
                      dataKey="bookings"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={DollarSign}
                title="Revenue Forecast"
                subtitle="Historical + projected weekly revenue"
                iconClassName="bg-emerald-100 text-emerald-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[...forecastData.historical, ...forecastData.forecasts]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [
                      formatCurrency(value as number),
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      className="text-xs fill-gray-700"
                      formatter={(v) =>
                        typeof v === "number" ? `$${Math.round(v)}` : v
                      }
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border p-6 w-full">
            <InsightsCardHeader
              icon={BarChart3}
              title="Historical vs Forecast"
              subtitle="Weekly bookings, revenue, and confidence"
              iconClassName="bg-indigo-100 text-indigo-600"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Week", "Kind", "Bookings", "Revenue", "Confidence"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastTableRows.map((row) => (
                    <tr
                      key={`${row.kind}-${row.week}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(row.week).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.kind}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          row.bookings > 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {row.bookings}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          row.revenue > 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.confidence != null
                          ? `${Math.round(row.confidence * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "quality" && isLoading && !analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {activeTab === "quality" && ov && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricStatCard
              icon={Star}
              title="Total Reviews"
              subtitle="Guest feedback volume"
              value={formatNumber(ov.totalReviews ?? 0)}
              tone={toneFromNumber(ov.totalReviews ?? 0)}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="Avg Rating"
              subtitle="Across all reviews"
              value={`${ov.avgReviewRating ?? 0} ★`}
              tone={
                (ov.avgReviewRating ?? 0) >= 4
                  ? "positive"
                  : (ov.avgReviewRating ?? 0) >= 3
                    ? "warning"
                    : (ov.avgReviewRating ?? 0) > 0
                      ? "negative"
                      : "neutral"
              }
              iconClassName="bg-yellow-100 text-yellow-600"
            />
            <MetricStatCard
              icon={BadgeCheck}
              title="Verified Reviews"
              subtitle={
                topCategory
                  ? `Top category: ${topCategory.category}`
                  : "Verified guest stays"
              }
              value={formatNumber(ov.verifiedReviewCount ?? 0)}
              tone={toneFromNumber(ov.verifiedReviewCount ?? 0)}
              iconClassName="bg-teal-100 text-teal-600"
            />
            <MetricStatCard
              icon={Ban}
              title="Cancel Rate"
              subtitle={`${formatNumber(ov.cancelledBookings ?? 0)} cancelled`}
              value={`${cancelRate}%`}
              tone={
                cancelRate > 15
                  ? "negative"
                  : cancelRate > 5
                    ? "warning"
                    : "positive"
              }
              iconClassName="bg-red-100 text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={BarChart3}
                title="Booking Status Mix"
                subtitle="Server-side status breakdown"
                iconClassName="bg-indigo-100 text-indigo-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, "Bookings"]} />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Star}
                title="Review Categories"
                subtitle="Average scores by category"
                iconClassName="bg-amber-100 text-amber-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryRows} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="category" width={90} />
                  <Tooltip formatter={(value) => [value, "Avg score"]} />
                  <Bar dataKey="score" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="score"
                      position="right"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(analyticsData.hotelsByStar?.length || analyticsData.guestMix) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {analyticsData.hotelsByStar &&
                analyticsData.hotelsByStar.length > 0 && (
                  <div className="bg-white rounded-xl shadow-xl border p-6">
                    <InsightsCardHeader
                      icon={Hotel}
                      title="Hotels by Star Rating"
                      subtitle="Inventory mix"
                      iconClassName="bg-sky-100 text-sky-600"
                    />
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analyticsData.hotelsByStar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="starRating" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, "Hotels"]} />
                        <Bar
                          dataKey="count"
                          fill="#0EA5E9"
                          radius={[4, 4, 0, 0]}
                        >
                          <LabelList
                            dataKey="count"
                            position="top"
                            className="text-xs fill-gray-700"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              {analyticsData.guestMix && (
                <div className="bg-white rounded-xl shadow-xl border p-6">
                  <InsightsCardHeader
                    icon={Users}
                    title="Guest Mix"
                    subtitle="Adults vs children across bookings"
                    iconClassName="bg-green-100 text-green-600"
                  />
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Adults",
                            count: analyticsData.guestMix.adults,
                          },
                          {
                            name: "Children",
                            count: analyticsData.guestMix.children,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, count }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                        }
                        outerRadius={80}
                        dataKey="count"
                        nameKey="name"
                      >
                        <Cell fill="#22C55E" />
                        <Cell fill="#A3E635" />
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Guests"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "quality" && !isLoading && !ov && (
        <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
          No quality metrics available yet.
        </div>
      )}

      {activeTab === "ops" && opsLoading && !opsData && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "ops" && opsData && (
        <div className={`w-full space-y-8 ${opsFetching ? "opacity-90" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={Activity}
              title="Memory Usage"
              subtitle={
                opsData.system?.memory != null
                  ? `${opsData.system.memory.used}MB / ${opsData.system.memory.total}MB`
                  : "Sign in for process metrics"
              }
              value={
                opsData.system?.memory != null
                  ? `${opsData.system.memory.percentage}%`
                  : "—"
              }
              tone={
                opsData.system?.memory != null &&
                opsData.system.memory.percentage > 85
                  ? "warning"
                  : "neutral"
              }
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={Server}
              title="Uptime"
              subtitle={
                opsData.system?.uptime != null
                  ? `${Math.round(opsData.system.uptime / 3600)}h process`
                  : "Availability SLA"
              }
              value={opsData.application.uptime}
              tone="positive"
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Clock}
              title="Response Time"
              subtitle="Demo avg (not live APM)"
              value={`${opsData.application.avgResponseTime}ms`}
              tone={
                opsData.application.avgResponseTime > 200
                  ? "warning"
                  : "positive"
              }
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={AlertCircle}
              title="Error Rate"
              subtitle={`Demo RPM: ${opsData.application.requestsPerMinute}`}
              value={`${(opsData.application.errorRate * 100).toFixed(2)}%`}
              tone={
                opsData.application.errorRate > 0.05
                  ? "negative"
                  : opsData.application.errorRate > 0.01
                    ? "warning"
                    : "positive"
              }
              iconClassName="bg-yellow-100 text-yellow-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Database}
                title="Database Overview"
                subtitle="Collections and booking totals"
                iconClassName="bg-slate-100 text-slate-600"
              />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Collections</span>
                  <span className="font-medium text-gray-700">
                    {opsData.database.collections ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Hotels</span>
                  <span className="font-medium text-gray-700">
                    {opsData.database.totalHotels}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Bookings</span>
                  <span
                    className={`font-medium ${
                      opsData.database.totalBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {opsData.database.totalBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                  <span
                    className={`font-medium ${
                      opsData.database.totalRevenue > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {formatCurrency(opsData.database.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Activity}
                title="Recent Activity"
                subtitle="Booking velocity"
                iconClassName="bg-cyan-100 text-cyan-600"
              />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">
                    Today&apos;s Bookings
                  </span>
                  <span
                    className={`font-medium ${
                      opsData.application.todayBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {opsData.application.todayBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">
                    This Week&apos;s Bookings
                  </span>
                  <span
                    className={`font-medium ${
                      opsData.application.thisWeekBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {opsData.application.thisWeekBookings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-gray-500 text-sm">
        Last updated:{" "}
        {analyticsData?.lastUpdated
          ? new Date(analyticsData.lastUpdated).toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
