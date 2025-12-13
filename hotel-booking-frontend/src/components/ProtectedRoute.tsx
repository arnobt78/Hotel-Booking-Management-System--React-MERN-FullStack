import { Navigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";

type Props = {
  children: JSX.Element;
  roles?: Array<"user" | "admin" | "hotel_owner">;
};

const ProtectedRoute = ({ children, roles }: Props) => {
  const { isLoggedIn, user } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (roles && user && !roles.includes(user.role!)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
