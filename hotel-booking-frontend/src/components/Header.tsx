import { useNavigate } from "react-router-dom";
import useSearchContext from "../hooks/useSearchContext";
import MobileNav from "./MobileNav";
import MainNav from "./MainNav";
import PageContainer from "./PageContainer";
import { Building2 } from "lucide-react";

const Header = () => {
  const search = useSearchContext();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    search.clearSearchValues();
    navigate("/");
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-large sticky top-0 z-50 h-[72px] flex items-center shrink-0">
      <PageContainer>
        <div className="flex justify-between items-center h-full">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 group"
          >
            <div className="bg-white p-2 rounded-xl shadow-soft group-hover:shadow-medium transition-all duration-300">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-lg md:text-2xl font-medium text-white tracking-tight group-hover:text-primary-100 transition-colors">
              HolidayHotel
            </span>
          </button>
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:flex items-center">
            <MainNav />
          </div>
        </div>
      </PageContainer>
    </header>
  );
};

export default Header;
