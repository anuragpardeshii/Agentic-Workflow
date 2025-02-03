import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      login(data.token);
      navigate("/ai");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0118] flex items-center justify-center p-4">
      <div className="bg-purple-900/20 p-8 rounded-xl border border-purple-500/20 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-purple-200 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:text-purple-300">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;