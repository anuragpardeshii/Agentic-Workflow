import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Theme from "../components/Theme.jsx";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://agentic-workflow-ftb9.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      login(data.token);
      navigate("/ai");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0118]">
      <Navbar />
      <Theme />
      <div className="flex max-w-7xl mx-auto min-h-[calc(90vh-8rem)]">
        {/* Left Side - Content */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative">
          <h1 className="text-5xl font-bold text-white mb-6 gradient-text">
            Build Your Vision
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            Create an account to start building stunning websites with AI.
            Transform your ideas into reality with our innovative platform.
          </p>
          <div className="">
            <p
              className="text-purple-300 hover:text-purple-200 text-lg font-medium transition-colors"
            >
              Already have an account?
              <span className="ml-2 underline"><Link to="/login">Log in</Link></span>
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-purple-900/20 p-8 rounded-2xl shadow-6xl backdrop-blur-lg">
              <h2 className="text-2xl font-bold text-white mb-8 gradient-text">
                Create Account
              </h2>
              {error && <p className="text-red-400 mb-4">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-purple-800/20 border border-none shadow-4xl text-white focus:ring-2 focus:ring-purple-800 focus:border-purple-800"
                    placeholder="johndoe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-purple-800/20 border border-none shadow-4xl text-white focus:ring-2 focus:ring-purple-800 focus:border-purple-800"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-purple-800/20 border border-none shadow-4xl text-white focus:ring-2 focus:ring-purple-800 focus:border-purple-800"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
