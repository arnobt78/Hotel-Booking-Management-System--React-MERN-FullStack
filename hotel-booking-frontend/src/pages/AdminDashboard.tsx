import { useState } from "react";
import { useQuery } from "react-query";
import {
  Users,
  Building2,
  CalendarDays,
  PoundSterling,
  Star,
  Heart,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

import { fetchAdminDashboard } from "../api-client";

type DashboardResponse = {
  kpis: {
    totalUsers: number;
    totalHotels: number;
    activeBookings: number;
    totalRevenue: number;
    avgHotelRating: number;
    totalFavorites: number;
  };
  charts: {
    bookingsByMonth: { month: string; value: number }[];
    revenueByMonth: { month: string; value: number }[];
    topHotelsByRevenue: {
      hotelId: string;
      name?: string;
      city?: string;
      revenue: number;
      bookings: number;
    }[];
    topHotelsByBookings: {
      hotelId: string;
      name?: string;
      city?: string;
      bookings: number;
      revenue: number;
    }[];
  };
  timestamp: string;
};

const AdminDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, error, refetch } = useQuery<DashboardResponse>(
    ["adminDashboard", refreshKey],
    fetchAdminDashboard,
    {
      refetchInterval: 30000,
      retry: 2,
      retryDelay: 1000,
    }
  );

  const formatCurrency = (v: number) => `£${Number(v).toLocaleString()}`;
  const formatShort = (v: number) =>
    Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : `${Number(v)}`;

  const trimLabel = (s?: string, max = 14) => {
    const str = s || "Unknown";
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
  };

  const NiceTooltip = ({
    active,
    payload,
    label,
    valueFormatter,
  }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border bg-white/95 backdrop-blur px-4 py-3 shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-gray-600">{p.name}</span>
            <span className="font-semibold text-gray-900">
              {valueFormatter ? valueFormatter(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Unavailable
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load admin dashboard data.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, charts, timestamp } = data;

  const kpiCards = [
    {
      label: "Total Users",
      value: kpis.totalUsers,
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "Total Hotels",
      value: kpis.totalHotels,
      icon: <Building2 className="w-5 h-5 text-green-600" />,
    },
    {
      label: "Active Bookings",
      value: kpis.activeBookings,
      icon: <CalendarDays className="w-5 h-5 text-purple-600" />,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      icon: <PoundSterling className="w-5 h-5 text-orange-600" />,
    },
    {
      label: "Avg Hotel Rating",
      value: kpis.avgHotelRating ? kpis.avgHotelRating.toFixed(2) : "0.00",
      icon: <Star className="w-5 h-5 text-yellow-600" />,
    },
    {
      label: "Total Favorites",
      value: kpis.totalFavorites,
      icon: <Heart className="w-5 h-5 text-red-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Real-time overview of bookings, revenue, ratings, and favorites
          </p>
        </div>

        {/* Top actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
            <button
              onClick={() => {
                setRefreshKey((x) => x + 1);
                refetch();
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {kpiCards.map((c) => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {c.label}
                  </span>
                  {c.icon}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bookings by Month
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={charts.bookingsByMonth}
                  margin={{ top: 16, right: 20, left: 10, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="4 6" />
                  <XAxis
                    dataKey="month"
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "", position: "insideBottom", offset: -6 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Bookings", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={(p) => (
                      <NiceTooltip {...p} valueFormatter={(v: number) => `${v}`} />
                    )}
                  />
                  <Legend verticalAlign="top" height={20} />
                  <Line
                    name="Bookings"
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {/* ✅ value label na svakoj tački */}
                  <LabelList dataKey="value" position="top" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Month
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={charts.revenueByMonth}
                  margin={{ top: 16, right: 20, left: 10, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="4 6" />
                  <XAxis
                    dataKey="month"
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "", position: "insideBottom", offset: -6 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatShort(v)}
                    label={{ value: "Revenue (£)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={(p) => (
                      <NiceTooltip {...p} valueFormatter={(v: number) => formatCurrency(v)} />
                    )}
                  />
                  <Legend verticalAlign="top" height={20} />
                  <Line
                    name="Revenue"
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v: any) => formatShort(Number(v))}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Hotels by Revenue
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.topHotelsByRevenue.map((h) => ({
                    ...h,
                    name: trimLabel(h.name),
                  }))}
                  margin={{ top: 16, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="4 6" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={50}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Hotel", position: "insideBottom", offset: -28 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatShort(v)}
                    label={{ value: "Revenue (£)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={(p) => (
                      <NiceTooltip {...p} valueFormatter={(v: number) => formatCurrency(v)} />
                    )}
                  />
                  <Legend verticalAlign="top" height={20} />
                  <Bar
                    name="Revenue"
                    dataKey="revenue"
                    fill="#7c3aed"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={48}
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(v: any) => formatShort(Number(v))}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Hotels by Bookings
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.topHotelsByBookings.map((h) => ({
                    ...h,
                    name: trimLabel(h.name),
                  }))}
                  margin={{ top: 16, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="4 6" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={50}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Hotel", position: "insideBottom", offset: -28 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Bookings", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={(p) => (
                      <NiceTooltip {...p} valueFormatter={(v: number) => `${v}`} />
                    )}
                  />
                  <Legend verticalAlign="top" height={20} />
                  <Bar
                    name="Bookings"
                    dataKey="bookings"
                    fill="#0ea5e9"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={48}
                  >
                    <LabelList dataKey="bookings" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm">
          Last updated:{" "}
          {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
