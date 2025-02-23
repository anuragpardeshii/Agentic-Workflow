import React from "react";
import {
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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Theme from "../components/Theme";

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
      <Theme/>
      <Navbar/>
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
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
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
              className="bg-purple-900/20 p-8 rounded-xl shadow-2xl backdrop-blur-sm"
            >
              <motion.div className="mb-4">
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
          className="max-w-6xl mx-auto bg-gradient-to-r from-purple-900/30 via-violet-900/30 to-purple-900/30 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to start building?
          </h2>
          <p className="text-xl mb-8 text-purple-200 max-w-2xl mx-auto">
            Join thousands of creators who have already built their perfect
            website using AIBuilder.
          </p>
          <Link to="/ai">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-medium text-lg mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            <Link to="/ai">
              <span>Start Building Free</span>
            </Link>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          </Link>
        </motion.div>
      </motion.div>
      <Footer/>
    </div>
  );
}

export default App;
