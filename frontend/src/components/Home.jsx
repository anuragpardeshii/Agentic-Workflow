import React from "react";
import {
  Bot,
  Code,
  Zap,
  Layout,
  Wand2,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

function App() {
  return (
    <div className="relative min-h-screen bg-[#0A0118] overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
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
      <div className="absolute inset-0">
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

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 container mx-auto px-6 py-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Bot className="w-8 h-8 text-purple-400" />
            </motion.div>
            <span className="text-xl font-bold text-white">bolt.old</span>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#features"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-purple-200 hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <Link to="/ai">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white transition-colors"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 pt-20 pb-24">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeIn} className="mb-8">
            <motion.div
              variants={floatingAnimation}
              className="flex justify-center space-x-4 mb-6"
            >
              <Code className="w-8 h-8 text-purple-400" />
              <Globe className="w-8 h-8 text-purple-300" />
              <Zap className="w-8 h-8 text-purple-500" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Build Websites with AI
            </h1>
            <p className="text-xl text-purple-200 mb-8">
              Transform your ideas into stunning websites in minutes. No coding
              required. Let AI do the heavy lifting.
            </p>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mb-12"
          >
            <Link to="/ai">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-medium text-lg"
              >
                <Wand2 className="w-5 h-5" />

                <span>Start Building Free</span>

                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 border border-purple-500/30 hover:border-purple-400 px-8 py-4 rounded-xl text-white font-medium text-lg"
            >
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex justify-center items-center space-x-8 text-purple-200"
          >
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>10K+ Users</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="relative container mx-auto px-6 py-24"
        id="features"
      >
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Everything you need to build faster
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Wand2 className="w-6 h-6 text-purple-400" />,
              title: "AI-Powered Design",
              description:
                "Describe your vision and watch as AI creates your perfect website.",
            },
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: "Lightning Fast",
              description:
                "Generate complete websites in minutes, not hours or days.",
            },
            {
              icon: <Layout className="w-6 h-6 text-green-400" />,
              title: "Responsive Design",
              description:
                "Every website is automatically optimized for all devices.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ scale: 1.05 }}
              className="bg-purple-900/20 p-8 rounded-xl border border-purple-500/20 backdrop-blur-sm"
            >
              <motion.div whileHover={{ scale: 1.1 }} className="mb-4">
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                {feature.title}
              </h3>
              <p className="text-purple-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative container mx-auto px-6 py-24"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-900/30 via-violet-900/30 to-purple-900/30 rounded-2xl p-12 text-center border border-purple-500/20 backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to start building?
          </h2>
          <p className="text-xl mb-8 text-purple-200 max-w-2xl mx-auto">
            Join thousands of creators who have already built their perfect
            website using AIBuilder.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-medium text-lg mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Building Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative border-t border-purple-500/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bot className="w-6 h-6 text-purple-400" />
              </motion.div>
              <span className="font-bold text-white">AIBuilder</span>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-purple-200 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-purple-200 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-purple-200 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Gradient Text Animation */}
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
}

export default App;
