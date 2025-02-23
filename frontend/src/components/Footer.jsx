import React from "react";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="relative border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => (window.location.href = "/")}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Bot className="w-6 h-6 text-purple-400" />
            </motion.div>
            <span className="font-bold text-white">BuildFast.new</span>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://stackblitz.com/terms-of-service"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="https://stackblitz.com/privacy-policy"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="/contact"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;