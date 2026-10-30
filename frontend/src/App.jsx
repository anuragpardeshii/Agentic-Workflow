import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIHome from "./pages/AIHome";
import { lazy, Suspense } from "react";
const Builder = lazy(() => import("./pages/Builder"));
const Deploy = lazy(() => import("./pages/Deploy"));
const AISettings = lazy(() => import("./pages/AISettings"));
export default function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <main className="product-page product-loading" role="status">
            Loading workspace…
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/ai" element={<AIHome />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/settings/ai" element={<AISettings />} />
          </Route>
          <Route
            path="*"
            element={
              <Layout>
                <div className="product-page empty-editor landing-container">
                  <p className="landing-kicker">A SMALL DETOUR</p>
                  <h1>Let’s find your way back.</h1>
                  <p>This page isn’t here, but your next idea is waiting.</p>
                  <Link to="/" className="landing-button">
                    Back home
                  </Link>
                </div>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
