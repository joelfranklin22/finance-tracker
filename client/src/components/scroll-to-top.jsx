import { useEffect } from "react";
import { useLocation } from "react-router";

// Next.js scrolls to the top on navigation; React Router does not by default.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
