import React from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 container mx-auto px-6 py-6"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleNavigate("/")}
        >
          <img src="/ai.png" alt="AI Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-white">Buildfast.ai</span>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
          <a
            onClick={() => handleNavigate("/features")}
            className="text-purple-200 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate("/ai")}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white transition-colors"
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
