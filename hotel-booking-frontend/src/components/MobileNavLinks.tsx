import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  FileText,
  Activity,
  Building2,
  Calendar,
  BarChart3,
  LogIn,
  Hotel,
} from "lucide-react";
import UsernameMenu from "./UsernameMenu";
import useAppContext from "../hooks/useAppContext";
import { getHotelsSearchUrl } from "../lib/nav-utils";

const linkClass =
  "flex items-center gap-2 w-full py-3 font-bold text-gray-900 hover:text-primary-600 transition-colors";

const MobileNavLinks = () => {
  const { isLoggedIn } = useAppContext();

  return (
    <div className="flex flex-col gap-1">
      <Link to={getHotelsSearchUrl()} className={linkClass}>
        <Hotel className="h-4 w-4" />
        Hotels
      </Link>
      <Link to="/my-bookings" className={linkClass}>
        <Calendar className="h-4 w-4" />
        My Bookings
      </Link>
      <Link to="/business-insights" className={linkClass}>
        <BarChart3 className="h-4 w-4" />
        Business Insights
      </Link>
      <Link to="/my-hotels" className={linkClass}>
        <Building2 className="h-4 w-4" />
        My Hotels
      </Link>
      <div className="py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          API
        </p>
        <Link to="/api-docs" className={`${linkClass} pl-4`}>
          <FileText className="h-4 w-4" />
          API Docs
        </Link>
        <Link to="/api-status" className={`${linkClass} pl-4`}>
          <Activity className="h-4 w-4" />
          API Status
        </Link>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="min-h-[52px] flex items-center justify-center">
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <Link to="/sign-in" className="w-full">
            <Button className="w-full font-bold bg-primary-600 hover:bg-primary-700">
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavLinks;
