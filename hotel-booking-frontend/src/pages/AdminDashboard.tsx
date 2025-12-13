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
      value: `£${Number(kpis.totalRevenue).toLocaleString()}`,
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bookings by Month
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.bookingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Month
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Hotels by Revenue
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.topHotelsByRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Hotels by Bookings
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.topHotelsByBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" />
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
