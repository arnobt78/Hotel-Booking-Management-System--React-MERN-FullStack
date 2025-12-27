import { Link, useNavigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import useSearchContext from "../hooks/useSearchContext";
import SignOutButton from "./SignOutButton";
import { BarChart3, Building2, Calendar, LogIn } from "lucide-react";

const Header = () => {
  const { isLoggedIn, user } = useAppContext();
  const role = user?.role; 
  const search = useSearchContext();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    search.clearSearchValues();
    navigate("/");
  };

  return (
    <>
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-large sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 group"
            >
              <div className="bg-white p-2 rounded-lg shadow-soft group-hover:shadow-medium transition-all duration-300">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight group-hover:text-primary-100 transition-colors">
                BookInn
              </span>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {isLoggedIn ? (
                <>
                  {role === "admin" && (
                    <Link
                      className="flex items-center text-white/90 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 group"
                      to="/admin"
                    >
                      <BarChart3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Admin
                    </Link>
                  )}

                  <Link
                    className="flex items-center text-white/90 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 group"
                    to="/my-bookings"
                  >
                    <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    My Bookings
                  </Link>

                  {role === "hotel_owner" && (
                    <Link
                      className="flex items-center text-white/90 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 group"
                      to="/my-hotels"
                    >
                      <Building2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      My Hotels
                    </Link>
                  )}

                  <SignOutButton />
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-50 hover:shadow-medium transition-all duration-200 group"
                >
                  <LogIn className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign In
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
