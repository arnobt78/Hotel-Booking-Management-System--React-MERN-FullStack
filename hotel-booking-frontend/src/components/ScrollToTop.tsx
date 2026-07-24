import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Instant scroll to top on route change — flush under sticky navbar */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
