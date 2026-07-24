import Footer from "../components/Footer";
import Header from "../components/Header";
import PageContainer from "../components/PageContainer";
import { useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

/**
 * App shell. Header/Footer static. Home stagger lives in Hero + Home only
 * (never wrap the hero blue bg in StaggerItem).
 */
const Layout = ({ children }: Props) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {isHomePage ? (
        <div className="flex-1">{children}</div>
      ) : (
        <PageContainer className="py-8 flex-1">{children}</PageContainer>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
