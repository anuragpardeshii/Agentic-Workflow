import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Layers } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../services/api";
export default function Auth({ register = false }) {
  const [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const result = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      login(result.token);
      navigate(location.state?.from || "/ai", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="product-page auth-page">
      <header className="auth-navigation">
        <Link to="/" className="site-brand" aria-label="Buildfast home">
          <Layers size={26} />
          buildfast
        </Link>
        <Link to="/" className="subtle-link">
          Back to the possibilities <ArrowRight size={15} />
        </Link>
      </header>
      <main id="main" className="auth-layout">
        <aside className="auth-story">
          <p className="landing-kicker">A LITTLE AI. A LOT OF POSSIBILITY.</p>
          <h2>
            Big ideas.
            <br />
            <span>Fresh beginnings.</span>
          </h2>
          <p>
            A place for the things you haven’t made yet.
            <br />
            Let’s see what you can bring to life.
          </p>
          <div className="auth-paper-wrap">
            <div className="auth-paper">
              <span className="paper-brand">
                <Layers size={17} />
                buildfast
              </span>
              <p>
                What if your next
                <br />
                idea started here?
              </p>
              <span className="paper-caption">
                Your words. Your website. Your next chapter.
              </span>
            </div>
            <span className="auth-paper-tag">MADE TO BE YOURS ↗</span>
          </div>
        </aside>
        <section className="auth-form-section">
          <div className="product-form auth-form">
            <p className="landing-kicker">
              {register ? "A FRESH START" : "YOUR CREATIVE WORKSPACE"}
            </p>
            <h1>{register ? "Make your next move." : "Welcome back."}</h1>
            <p className="form-description">
              {register
                ? "Create your account. Give your next idea a home."
                : "Pick up where your last idea left off."}
            </p>
            <form onSubmit={submit} aria-busy={busy}>
              {register && (
                <label className="field">
                  Your name
                  <input
                    name="username"
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={50}
                    disabled={busy}
                  />
                </label>
              )}
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={busy}
                />
              </label>
              <label className="field" htmlFor="auth-password">
                Password
              </label>
              <div className="password-control">
                <input
                  id="auth-password"
                  name="password"
                  type={visible ? "text" : "password"}
                  placeholder={
                    register ? "At least 8 characters" : "Enter your password"
                  }
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={register ? 8 : 1}
                  maxLength={72}
                  disabled={busy}
                  aria-describedby={register ? "password-hint" : undefined}
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {register && (
                <p id="password-hint" className="field-hint">
                  Use at least 8 characters.
                </p>
              )}
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              <button disabled={busy} className="landing-button auth-submit">
                {busy
                  ? "Please wait…"
                  : register
                    ? "Create account"
                    : "Sign in"}
                <ArrowRight size={17} />
              </button>
            </form>
            <p className="auth-switch">
              {register ? "Already have an account?" : "New to Buildfast?"}{" "}
              <Link
                to={register ? "/login" : "/register"}
                state={location.state}
              >
                {register ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Buildfast</span>
        <span>Your ideas. Your code. Your possibilities.</span>
      </footer>
    </div>
  );
}
