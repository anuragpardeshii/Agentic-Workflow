import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import { motion } from "framer-motion";
import Theme from "../components/Theme.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

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
      const response = await fetch("https://agentic-workflow-ftb9.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
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
    <div className="h-full bg-[#0A0118] flex items-center justify-center p-4 overflow-hidden">
      <Theme />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="bg-purple-900/20 p-8 rounded-xl border border-purple-500/20 w-full max-w-md shadow-lg relative z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center gradient-text">
          Register
        </h2>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 mb-4">{error}</motion.p>}
        <form onSubmit={handleSubmit}>
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg bg-purple-800/20 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            Register
          </motion.button>
        </form>
        <p className="mt-4 text-purple-200 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
    <Footer/>
    </div>
  );
};

export default Register;
