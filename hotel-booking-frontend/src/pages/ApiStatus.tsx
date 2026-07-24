import { useState } from "react";
import { useQuery } from "react-query";
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useAppContext from "../hooks/useAppContext";

/** Public liveness shape from GET /api/health (minimal — no infra recon data) */
interface HealthData {
  status: string;
  timestamp: string;
  database?: {
    status: string;
  };
}

/** Auth-only sanitized metrics from GET /api/health/detailed */
interface DetailedHealthData {
  status: string;
  timestamp: string;
  performance: {
    memory: {
      usedMb: number;
      totalMb: number;
      percentage: number;
    };
    uptime: number;
  };
  database: {
    status: string;
  };
}

const ApiStatus = () => {
  const [isDetailed, setIsDetailed] = useState(false);
  const { isLoggedIn } = useAppContext();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const {
    data: healthData,
    isLoading,
    error,
    refetch,
  } = useQuery<HealthData>(
    "health",
    async () => {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return response.json();
    },
    {
      refetchInterval: 30000,
      retry: 3,
      retryDelay: 1000,
    },
  );

  // Detailed requires JWT — Bearer from localStorage (same as axios interceptor)
  const {
    data: detailedData,
    error: detailedError,
    isError: isDetailedError,
  } = useQuery<DetailedHealthData>(
    "detailedHealth",
    async () => {
      const token = localStorage.getItem("session_id");
      const response = await fetch(`${apiBaseUrl}/api/health/detailed`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 401) {
        throw new Error("SIGN_IN_REQUIRED");
      }
      if (!response.ok) {
        throw new Error("Detailed health check failed");
      }
      return response.json();
    },
    {
      enabled: isDetailed && isLoggedIn,
      refetchInterval: isDetailed && isLoggedIn ? 30000 : false,
      retry: false,
    },
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unhealthy":
      case "disconnected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "bg-green-100 text-green-800";
      case "unhealthy":
      case "disconnected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking API status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg md:text-2xl font-medium text-gray-700 mb-2">
            API Unavailable
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the API server.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const needsSignInForDetails =
    isDetailed &&
    (!isLoggedIn ||
      (isDetailedError &&
        detailedError instanceof Error &&
        detailedError.message === "SIGN_IN_REQUIRED"));

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-lg md:text-2xl font-medium text-gray-700 mb-4">
          API Status
        </h1>
        <p className="text-xl text-gray-600">
          Real-time monitoring of our hotel booking API health and performance
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Server className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-lg md:text-2xl font-medium text-gray-700">
              Overall Status
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDetailed(!isDetailed)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isDetailed ? "Hide Details" : "Show Details"}
            </button>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                API Status
              </span>
              {getStatusIcon(healthData?.status || "unknown")}
            </div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                healthData?.status || "unknown",
              )}`}
            >
              {healthData?.status || "Unknown"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Database
              </span>
              {getStatusIcon(healthData?.database?.status || "unknown")}
            </div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                healthData?.database?.status || "unknown",
              )}`}
            >
              {healthData?.database?.status || "Unknown"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Probe time
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {healthData?.timestamp
                ? new Date(healthData.timestamp).toLocaleTimeString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {needsSignInForDetails && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 pb-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-amber-900 font-medium">
            Sign in to view detailed status
          </p>
          <p className="text-sm text-amber-800 mt-1">
            Detailed metrics require authentication and no longer expose
            infrastructure identifiers.
          </p>
        </div>
      )}

      {isDetailed && detailedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <Database className="w-5 h-5 text-green-600 " />
              Database
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    detailedData.database.status === "connected"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {detailedData.database.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <HardDrive className="w-5 h-5 text-blue-600 " />
              Memory (rounded MB)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium">
                  {detailedData.performance.memory.usedMb} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">
                  {detailedData.performance.memory.totalMb} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium">
                  {detailedData.performance.memory.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailed && detailedData && (
        <div className="bg-white rounded-xl shadow-sm border p-6 pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-purple-600 " />
            Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-medium text-blue-600">
                {detailedData.performance.memory.percentage}%
              </div>
              <div className="text-sm text-gray-600">Heap usage</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-medium text-orange-600">
                {formatUptime(detailedData.performance.uptime)}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-gray-500 text-sm">
        Last updated:{" "}
        {healthData?.timestamp
          ? new Date(healthData.timestamp).toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
};

export default ApiStatus;
