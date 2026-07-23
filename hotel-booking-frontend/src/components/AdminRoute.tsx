import { Navigate } from "react-router-dom";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";

type Props = {
  children: React.ReactNode;
};

/** Gate: must be logged in and role === admin (from GET /api/users/me) */
const AdminRoute = ({ children }: Props) => {
  const { isLoggedIn } = useAppContext();

  const { data: user, isLoading } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser,
    { enabled: isLoggedIn }
  );

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
