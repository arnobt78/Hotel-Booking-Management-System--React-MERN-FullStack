import { useState } from "react";
import { useQuery } from "react-query";
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    collections: number;
    name: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  environment: string;
  version: string;
}

interface DetailedHealthData {
  status: string;
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    pid: number;
  };
  performance: {
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpu: {
      user: number;
      system: number;
    };
    uptime: number;
  };
  database: {
    status: string;
    readyState: number;
    host: string;
    port: number;
    name: string;
  };
}

const ApiStatus = () => {
  const [isDetailed, setIsDetailed] = useState(false);
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7002";

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
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 3,
      retryDelay: 1000,
    }
  );

  const { data: detailedData } = useQuery<DetailedHealthData>(
    "detailedHealth",
    async () => {
      const response = await fetch(`${apiBaseUrl}/api/health/detailed`);
      if (!response.ok) {
        throw new Error("Detailed health check failed");
      }
      return response.json();
    },
    {
      enabled: isDetailed,
      refetchInterval: isDetailed ? 30000 : false,
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "unhealthy":
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

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            API Unavailable
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the API server.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Status</h1>
          <p className="text-xl text-gray-600">
            Real-time monitoring of our hotel booking API health and performance
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Server className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* API Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  API Status
                </span>
                {getStatusIcon(healthData?.status || "unknown")}
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  healthData?.status || "unknown"
                )}`}
              >
                {healthData?.status || "Unknown"}
              </span>
            </div>

            {/* Database Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Database
                </span>
                {getStatusIcon(healthData?.database.status || "unknown")}
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  healthData?.database.status || "unknown"
                )}`}
              >
                {healthData?.database.status || "Unknown"}
              </span>
            </div>

            {/* Uptime */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Uptime
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {healthData?.uptime ? formatUptime(healthData.uptime) : "N/A"}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Memory Usage
                </span>
                <HardDrive className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {healthData?.memory.percentage || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {isDetailed && detailedData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* System Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="w-5 h-5 text-blue-600 mr-2" />
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">
                    {detailedData.system.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Architecture:</span>
                  <span className="font-medium">
                    {detailedData.system.arch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version:</span>
                  <span className="font-medium">
                    {detailedData.system.nodeVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Process ID:</span>
                  <span className="font-medium">{detailedData.system.pid}</span>
                </div>
              </div>
            </div>

            {/* Database Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 text-green-600 mr-2" />
                Database Information
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Host:</span>
                  <span className="font-medium">
                    {detailedData.database.host}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Port:</span>
                  <span className="font-medium">
                    {detailedData.database.port}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium">
                    {detailedData.database.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {isDetailed && detailedData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatBytes(detailedData.performance.memory.heapUsed)}
                </div>
                <div className="text-sm text-gray-600">Heap Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatBytes(detailedData.performance.memory.heapTotal)}
                </div>
                <div className="text-sm text-gray-600">Heap Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatBytes(detailedData.performance.memory.rss)}
                </div>
                <div className="text-sm text-gray-600">RSS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatUptime(detailedData.performance.uptime)}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm">
          Last updated:{" "}
          {healthData?.timestamp
            ? new Date(healthData.timestamp).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
