import { useState, useEffect } from "react";
import { api } from "../services/api";
import { AuthContext } from "../lib/auth";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("project");
    setUser(null);
  };
  useEffect(() => {
    let active = true;
    // Legacy localStorage drafts are left intact but never reused across accounts.
    if (sessionStorage.getItem("token"))
      api("/auth/validate")
        .then((data) => {
          if (active) setUser(data.user);
        })
        .catch(() => {
          if (active) logout();
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    else setIsLoading(false);
    window.addEventListener("auth-expired", logout);
    return () => {
      active = false;
      window.removeEventListener("auth-expired", logout);
    };
  }, []);
  const login = (token) => {
    sessionStorage.setItem("token", token);
    setUser({ token });
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
