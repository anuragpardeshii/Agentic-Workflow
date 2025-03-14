import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Theme from "../components/Theme";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://agentic-backend-psi.vercel.app/api/contact", {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      setFormData({
        email: "",
        name: "",
        message: "",
      });
    } catch (error) {
      throw error;
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0118] flex flex-col">
      <Theme />
      <Navbar />
      {/* Main Content */}
      <div className="relative flex-grow container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            Get in Touch
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-900/20 p-8 rounded-xl border border-purple-500/20 backdrop-blur-sm relative"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-purple-200 mb-2">Name</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Email</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  name="email"
                  placeholder="johndoe@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Message</label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  name="message"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-lg font-medium text-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              {error && (
                <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: submitted ? 1 : 0 }}
                className="absolute top-4 right-4"
              >
                {submitted && (
                  <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg border border-green-500/30">
                    Message sent successfully!
                  </div>
                )}
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
