import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You don’t have permission to access this page.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Go Home
          </Link>

          <Link
            to="/sign-in"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;