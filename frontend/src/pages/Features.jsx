import React from "react";
import { motion } from "framer-motion";
import { Code, Wand2, Sparkles, ArrowRight, Globe } from "lucide-react";
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

const RoadmapStep = ({ step, title, description, isActive, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 }}
      className="relative flex items-start space-x-8 group"
    >
      {/* Connection Line */}
      {index < 4 && (
        <div className="absolute top-12 left-6 w-0.5 h-24 bg-gradient-to-b from-purple-600 to-violet-600 opacity-30" />
      )}

      {/* Step Circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center"
      >
        <span className="text-white font-bold">{step}</span>
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/20 backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-purple-200">{description}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const handleGetStarted = () => {
    // Handle navigation programmatically or through a callback
    window.location.href = "/ai";
  };

  return (
    <div className="relative min-h-screen bg-[#0A0118] overflow-hidden">
      <Theme />
      <Navbar />
      {/* Hero Section */}
      <div className="relative container mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeIn} className="mb-8">
            <motion.div
              variants={floatingAnimation}
              className="flex justify-center space-x-4 mb-6"
            >
              <Code className="w-8 h-8 text-purple-400" />
              <Globe className="w-8 h-8 text-purple-300" />
              <Sparkles className="w-8 h-8 text-purple-500" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              How Bolt Works
            </h1>
            <p className="text-xl text-purple-200">
              Transform your ideas into production-ready websites in minutes
              with our AI-powered platform
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Roadmap */}
      <div className="relative container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <RoadmapStep
            step="1"
            title="Describe Your Vision"
            description="Simply describe your website using natural language. Our AI understands your requirements and preferences."
            index={0}
          />
          <RoadmapStep
            step="2"
            title="AI Generates Your Site"
            description="Watch as our AI transforms your description into a fully-functional website with modern design and clean code."
            index={1}
          />
          <RoadmapStep
            step="3"
            title="Customize & Preview"
            description="Fine-tune your website in real-time with our interactive editor. See changes instantly as you make them."
            index={2}
          />
          <RoadmapStep
            step="4"
            title="Deploy to Production"
            description="One-click deployment to Vercel's global edge network. Your website goes live instantly with blazing-fast performance."
            index={3}
          />
        </div>
      </div>

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
            website using Bolt.
          </p>
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-medium text-lg mx-auto"
          >
            <Wand2 className="w-5 h-5" />
            <span>Start Building Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Features;
