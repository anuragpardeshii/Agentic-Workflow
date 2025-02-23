import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import Theme from "../components/Theme.jsx";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://agentic-workflow-708v.onrender.com/api/auth/login", {
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
    <div className="h-screen bg-[#0A0118] flex flex-col">
      <Navbar/>
    <div className=" h-full bg-[#0A0118] flex items-center justify-center p-4 overflow-hidden">
      <Theme />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-purple-900/20 p-8 rounded-xl border border-purple-500/20 w-full max-w-md backdrop-blur-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center gradient-text">Login</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-all"
          >
            Login
          </motion.button>
        </form>
        <p className="mt-4 text-purple-200 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:text-purple-300">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
    <Footer/>
    </div>
  );
};

export default Login;
