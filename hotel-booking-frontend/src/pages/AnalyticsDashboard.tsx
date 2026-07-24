import { useState } from "react";
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
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalHotels: number;
    totalUsers: number;
    totalBookings: number;
    recentBookings: number;
    totalRevenue: number;
    recentRevenue: number;
    revenueGrowth: number;
  };
  popularDestinations: Array<{
    _id: string;
    count: number;
    avgPrice: number;
  }>;
  dailyBookings: Array<{
    date: string;
    bookings: number;
  }>;
  hotelPerformance: Array<{
    name: string;
    city: string;
    starRating: number;
    pricePerNight: number;
    bookingCount: number;
    totalRevenue: number;
  }>;
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
  /** Present on auth /system-stats only — omitted from public (CWE-200) */
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

const AnalyticsDashboard = () => {
  // Shell renders immediately; data regions use inline pulse (no full-page spinner)
  const [activeTab, setActiveTab] = useState<"overview" | "forecast" | "ops">(
    "overview",
  );

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQueryWithLoading<AnalyticsData>(
    "business-insights-dashboard",
    fetchBusinessInsightsDashboard,
    {
      refetchInterval: false,
      retry: 3,
      retryDelay: 1000,
    },
  );

  const { data: forecastData, isLoading: forecastLoading } =
    useQueryWithLoading<ForecastData>(
      "business-insights-forecast",
      fetchBusinessInsightsForecast,
      {
        refetchInterval: false,
        retry: 3,
        retryDelay: 1000,
      },
    );

  const { data: opsData, isLoading: opsLoading } =
    useQueryWithLoading<OpsStatusData>(
      "business-insights-ops",
      fetchBusinessInsightsSystemStats,
      {
        refetchInterval: false,
        retry: 3,
        retryDelay: 1000,
      },
    );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — always visible */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-sm md:text-lg font-medium text-gray-700 mb-2">
              Business Insights Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into your hotel booking business
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 " />
            Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border pb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview" as const, label: "Overview", icon: BarChart3 },
                {
                  id: "forecast" as const,
                  label: "Forecasting",
                  icon: TrendingUp,
                },
                { id: "ops" as const, label: "Ops status", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 " />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Inline error for dashboard load (content area only) */}
        {error && activeTab === "overview" && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border p-6 pb-6 text-center">
            <p className="text-red-500 mb-4">
              Failed to load business insights data
            </p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview loading — inline pulses matching KPI / chart boxes */}
        {activeTab === "overview" && isLoading && (
          <div className="w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-200 rounded-xl animate-pulse"
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

        {/* Overview Tab */}
        {activeTab === "overview" && analyticsData && (
          <div className="w-full space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Hotels
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {formatNumber(analyticsData.overview.totalHotels)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {formatNumber(analyticsData.overview.totalUsers)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Bookings
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {formatNumber(analyticsData.overview.totalBookings)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {formatCurrency(analyticsData.overview.totalRevenue)}
                    </p>
                    <div className="flex items-center mt-1">
                      {analyticsData.overview.revenueGrowth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          analyticsData.overview.revenueGrowth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {analyticsData.overview.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {/* Daily Bookings Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Daily Bookings
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.dailyBookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                      formatter={(value) => [value, "Bookings"]}
                    />
                    <Bar dataKey="bookings" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Popular Destinations */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Popular Destinations
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.popularDestinations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.popularDestinations.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Bookings"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hotel Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border p-6 w-full">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Top Performing Hotels
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Night
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.hotelPerformance
                      .slice(0, 10)
                      .map((hotel, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {hotel.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hotel.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hotel.starRating} ⭐
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(hotel.pricePerNight)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hotel.bookingCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

        {/* Forecast loading */}
        {activeTab === "forecast" && forecastLoading && !forecastData && (
          <div className="w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === "forecast" && forecastData && (
          <div className="w-full space-y-8">
            {/* Forecast Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Booking Trend
                </h3>
                <div className="flex items-center">
                  {forecastData.trends.bookingTrend === "increasing" ? (
                    <TrendingUp className="w-6 h-6 text-green-500 " />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500 " />
                  )}
                  <span className="text-sm md:text-lg font-medium text-gray-700 capitalize">
                    {forecastData.trends.bookingTrend}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Revenue Trend
                </h3>
                <div className="flex items-center">
                  {forecastData.trends.revenueTrend === "increasing" ? (
                    <TrendingUp className="w-6 h-6 text-green-500 " />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500 " />
                  )}
                  <span className="text-sm md:text-lg font-medium text-gray-700 capitalize">
                    {forecastData.trends.revenueTrend}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Seasonal Growth
                </h3>
                <div className="flex items-center">
                  {forecastData.seasonalGrowth >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-500 " />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500 " />
                  )}
                  <span
                    className={`text-sm md:text-lg font-medium ${
                      forecastData.seasonalGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {forecastData.seasonalGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Forecast Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {/* Historical vs Forecast Bookings */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Booking Forecast
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[
                      ...forecastData.historical,
                      ...forecastData.forecasts,
                    ]}
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
                      formatter={(value, name) => [
                        value,
                        name === "bookings" ? "Bookings" : "Forecast",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Forecast */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Revenue Forecast
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      ...forecastData.historical,
                      ...forecastData.forecasts,
                    ]}
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Ops status loading */}
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

        {/* Ops status tab (system-stats; avoids /performance in paths & UI labels) */}
        {activeTab === "ops" && opsData && (
          <div className="w-full space-y-8">
            {/* System figures */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Memory Usage
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {opsData.system?.memory.percentage ?? "—"}
                      {opsData.system?.memory != null ? "%" : ""}
                    </p>
                    <p className="text-sm text-gray-500">
                      {opsData.system?.memory != null
                        ? `${opsData.system.memory.used}MB / ${opsData.system.memory.total}MB`
                        : "Sign in for process metrics"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Server className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {opsData.application.uptime}
                    </p>
                    <p className="text-sm text-gray-500">
                      {opsData.system?.uptime != null
                        ? `${Math.round(opsData.system.uptime / 3600)}h ${Math.round((opsData.system.uptime % 3600) / 60)}m`
                        : "Availability SLA"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Response Time
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {opsData.application.avgResponseTime}ms
                    </p>
                    <p className="text-sm text-gray-500">Average</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Error Rate
                    </p>
                    <p className="text-sm md:text-lg font-medium text-gray-700">
                      {(opsData.application.errorRate * 100).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Requests per minute:{" "}
                      {opsData.application.requestsPerMinute}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Database Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Collections</span>
                    <span className="font-medium">
                      {opsData.database.collections ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Hotels</span>
                    <span className="font-medium">
                      {opsData.database.totalHotels}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium">
                      {opsData.database.totalBookings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(opsData.database.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today's Bookings</span>
                    <span className="font-medium">
                      {opsData.application.todayBookings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week's Bookings</span>
                    <span className="font-medium">
                      {opsData.application.thisWeekBookings}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm mt-8">
          Last updated:{" "}
          {analyticsData?.lastUpdated
            ? new Date(analyticsData.lastUpdated).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
