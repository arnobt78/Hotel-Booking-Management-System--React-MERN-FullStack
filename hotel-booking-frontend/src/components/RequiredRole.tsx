import { Navigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";

type Props = {
  allowedRoles: ("user" | "admin" | "hotel_owner")[];
  children: JSX.Element;
};

const RequireRole = ({ allowedRoles, children }: Props) => {
  const { isLoggedIn, user } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!user || !allowedRoles.includes(user.role!)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;
