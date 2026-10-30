import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
export default function Layout({ children, footer = true }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      {footer && <Footer />}
    </>
  );
}
