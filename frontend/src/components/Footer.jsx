import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="landing-container">
        <div className="footer-top">
          <div>
            <Link to="/" className="site-brand">
              <Layers size={24} />
              buildfast
            </Link>
            <p>A little less friction. A lot more creating.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Make something</strong>
              <Link to="/ai">Your workspace</Link>
              <Link to="/features">Explore the platform</Link>
              <Link to="/#possibilities">Find inspiration</Link>
            </div>
            <div>
              <strong>Keep in touch</strong>
              <Link to="/contact">Contact us</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Buildfast</span>
          <span>Your ideas. Your code. Your next chapter.</span>
        </div>
      </div>
    </footer>
  );
}
