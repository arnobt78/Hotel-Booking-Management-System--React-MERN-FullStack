import Footer from "../components/Footer";
import Header from "../components/Header";
import { StaggerItem, StaggerScope } from "../components/ui/stagger";
import { useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

/**
 * Auth shell. Header/Footer static; sign-in/register content may stagger.
 */
const AuthLayout = ({ children }: Props) => {
  const location = useLocation();
  const path = location.pathname;
  const staggerAuth = path === "/sign-in" || path === "/register";

  if (staggerAuth) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <StaggerScope resetKey={path} className="flex-1 flex flex-col">
          <StaggerItem index={0} className="flex-1">
            {children}
          </StaggerItem>
        </StaggerScope>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
