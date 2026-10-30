import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "../lib/auth";
import "../landing.css";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="site-brand" aria-label="Buildfast home">
          <Layers size={27} strokeWidth={2.4} />
          buildfast
        </Link>
        <div className="site-nav-links">
          <NavLink to="/features">Platform</NavLink>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#possibilities">Inspiration</Link>
          <NavLink to="/contact">Contact</NavLink>
        </div>
        <div className="site-nav-account">
          {user && <Link to="/settings/ai">AI settings</Link>}
          {user ? (
            <button onClick={logout}>Sign out</button>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
          <Link className="nav-create" to="/ai">
            {user ? "Workspace" : "Start creating"}{" "}
            <ArrowUpRight className="inline ml-1" size={13} />
          </Link>
        </div>
        <button
          className="mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="site-mobile-links" id="mobile-navigation">
          {[
            ["/features", "Platform"],
            ["/#how-it-works", "How it works"],
            ["/#possibilities", "Inspiration"],
            ["/ai", "Workspace"],
            ["/contact", "Contact"],
            ...(user ? [["/settings/ai", "AI settings"]] : []),
            ...(!user ? [["/login", "Sign in"]] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {user && (
            <button
              className="text-left"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
