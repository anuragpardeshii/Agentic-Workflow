import React from "react";
import { motion } from "framer-motion";

const Theme = () => {
  return (
    <div>
        {/* Animated background gradient */}
              <motion.div
                className="fixed inset-0 opacity-30"
                animate={{
                  background: [
                    "radial-gradient(circle at 50% 50%, #4A1D96 0%, #0A0118 70%)",
                    "radial-gradient(circle at 60% 60%, #6D28D9 0%, #0A0118 70%)",
                    "radial-gradient(circle at 40% 40%, #4A1D96 0%, #0A0118 70%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />
           
              {/* Floating particles */}
              <div className="fixed inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full"
                    initial={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: Math.random() * 10 + 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>
              <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .gradient-text {
            background: linear-gradient(45deg, #8b5cf6, #7c3aed, #6d28d9);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientAnimation 5s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Theme;