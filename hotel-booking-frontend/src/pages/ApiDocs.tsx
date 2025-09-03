import {
  ExternalLink,
  FileText,
  Code,
  Database,
  Shield,
  Zap,
} from "lucide-react";

const ApiDocs = () => {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7002";

  const apiEndpoints = [
    {
      category: "Authentication",
      icon: <Shield className="w-5 h-5" />,
      endpoints: [
        { method: "POST", path: "/api/auth/login", description: "User login" },
        {
          method: "GET",
          path: "/api/auth/validate-token",
          description: "Validate token",
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "User logout",
        },
      ],
    },
    {
      category: "Users",
      icon: <Database className="w-5 h-5" />,
      endpoints: [
        {
          method: "POST",
          path: "/api/users/register",
          description: "Register new user",
        },
        {
          method: "GET",
          path: "/api/users/me",
          description: "Get current user",
        },
      ],
    },
    {
      category: "Hotels",
      icon: <FileText className="w-5 h-5" />,
      endpoints: [
        { method: "GET", path: "/api/hotels", description: "Get all hotels" },
        {
          method: "GET",
          path: "/api/hotels/search",
          description: "Search hotels",
        },
        {
          method: "GET",
          path: "/api/hotels/:id",
          description: "Get hotel by ID",
        },
        { method: "POST", path: "/api/my-hotels", description: "Add hotel" },
        {
          method: "GET",
          path: "/api/my-hotels",
          description: "Get user's hotels",
        },
        {
          method: "PUT",
          path: "/api/my-hotels/:id",
          description: "Update hotel",
        },
        {
          method: "DELETE",
          path: "/api/my-hotels/:id",
          description: "Delete hotel",
        },
      ],
    },
    {
      category: "Bookings",
      icon: <Code className="w-5 h-5" />,
      endpoints: [
        {
          method: "POST",
          path: "/api/hotels/:id/bookings",
          description: "Create booking",
        },
        {
          method: "GET",
          path: "/api/my-bookings",
          description: "Get user's bookings",
        },
        {
          method: "POST",
          path: "/api/hotels/:id/bookings/payment-intent",
          description: "Create payment intent",
        },
      ],
    },
    {
      category: "Health & Analytics",
      icon: <Zap className="w-5 h-5" />,
      endpoints: [
        {
          method: "GET",
          path: "/api/health",
          description: "API health status",
        },
        {
          method: "GET",
          path: "/api/health/detailed",
          description: "Detailed health info",
        },
        {
          method: "GET",
          path: "/api/business-insights/dashboard",
          description: "Analytics dashboard",
        },
        {
          method: "GET",
          path: "/api/business-insights/forecast",
          description: "Booking forecasts",
        },
        {
          method: "GET",
          path: "/api/business-insights/performance",
          description: "Performance metrics",
        },
      ],
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive documentation for the Hotel Booking API. Explore
            endpoints, understand authentication, and integrate with our
            services.
          </p>
        </div>

        {/* API Base URL */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Base URL
          </h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <code className="text-lg font-mono text-gray-800">
              {apiBaseUrl}
            </code>
          </div>
          <p className="text-gray-600 mt-2">
            All API endpoints are relative to this base URL.
          </p>
        </div>

        {/* Swagger UI Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Interactive API Documentation
              </h3>
              <p className="text-blue-700">
                Explore our interactive Swagger UI documentation for detailed
                endpoint specifications, request/response schemas, and testing
                capabilities.
              </p>
            </div>
            <a
              href={`${apiBaseUrl}/api-docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Swagger UI
            </a>
          </div>
        </div>

        {/* Endpoints by Category */}
        <div className="space-y-8">
          {apiEndpoints.map((category) => (
            <div
              key={category.category}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.category}
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {category.endpoints.map((endpoint, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(
                            endpoint.method
                          )}`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {endpoint.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              The API uses JWT (JSON Web Tokens) for authentication. Most
              endpoints require authentication via HTTP-only cookies.
            </p>
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Authentication Flow:
              </h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Register or login to receive a JWT token</li>
                <li>Token is automatically stored in HTTP-only cookies</li>
                <li>Include credentials in subsequent requests</li>
                <li>Token is validated on protected endpoints</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Rate Limiting
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Rate Limit:</strong> 100 requests per 15 minutes per IP
              address
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Exceeding this limit will result in a 429 Too Many Requests
              response.
            </p>
          </div>
        </div>

        {/* Error Handling */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Error Handling
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">
                Standard Error Response:
              </h4>
              <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                {`{
  "error": "Error message",
  "message": "Detailed error description"
}`}
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Common Status Codes:
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">200</code> -
                    Success
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">400</code> - Bad
                    Request
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">401</code> -
                    Unauthorized
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">403</code> -
                    Forbidden
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">404</code> - Not
                    Found
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">429</code> - Too
                    Many Requests
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">500</code> -
                    Server Error
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
