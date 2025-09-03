import Footer from "../components/Footer";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
// import Hero from "../components/Hero";
// import SearchBar from "../components/SearchBar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const location = useLocation();
  // const isAnalyticsPage = location.pathname === "/analytics";
  // const isSearchPage = location.pathname === "/search";
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* <Hero /> */}
      {/* <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar />
      </div> */}
      {isHomePage ? (
        <div className="flex-1">{children}</div>
      ) : (
        <div className="w-full px-2 sm:px-6 lg:px-8 py-10 flex-1">
          {children}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
