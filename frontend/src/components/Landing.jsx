import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button, TextInput } from "flowbite-react";
import { Wand2, Sparkles, Code2, Globe, Shapes } from "lucide-react";
import { generateResponse } from "../services/api";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [getResponse, setGetResponse] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const examplePrompts = [
    "Build a modern blog with dark mode",
    "Design a landing page for a SaaS product",
    "Make an e-commerce store for artisanal coffee",
    "Create a personal photography showcase",
    "Create a portfolio website",
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    try {
      const response = await generateResponse(prompt);

      localStorage.setItem("content", response.content);

      const separateJsonAndText = (content) => {
        const jsonRegex = /```json\s*({[\s\S]*?})\s*```/;
        const match = content.match(jsonRegex);

        if (match) {
          const jsonString = match[1];
          const instructions = content.replace(match[0], "").trim();

          return {
            jsonData: JSON.parse(jsonString),
            instructions: instructions,
          };
        }

        return null;
      };

      const parsedContent = separateJsonAndText(response.content);

      if (parsedContent) {
        localStorage.setItem("prompt", response.prompt);
        localStorage.setItem(
          "jsonData",
          JSON.stringify(parsedContent.jsonData)
        );
        localStorage.setItem("instructions", parsedContent.instructions);

        console.log("JSON Data:", parsedContent.jsonData);
        console.log("Instructions:", parsedContent.instructions);
      } else {
        console.log("No JSON found in content");
      }
    } catch (error) {
      console.error("Error generating response:", error.message);
    }

    setGetResponse(localStorage.getItem("jsonData"));
  };

  useEffect(() => {
    if (getResponse !== null) {
      navigate("/builder", { state: getResponse });
    }
  }, [getResponse, navigate]);

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const floatingIcons = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

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

      {/* Custom cursor glow effect */}
      <motion.div
        className="fixed w-64 h-64 rounded-full pointer-events-none"
        animate={{
          x: cursorPosition.x - 128,
          y: cursorPosition.y - 128,
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)",
        }}
        transition={{ type: "spring", damping: 30 }}
      />

      {/* Zoomed-out container */}
      <div className="relative flex items-center justify-center min-h-screen p-4 transform scale-90">
        <motion.div
          className="max-w-2xl w-full space-y-12 text-center"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          {/* Header section */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <motion.div
              className="flex justify-center space-x-4 mb-8"
              variants={floatingIcons}
            >
              <Code2 className="w-8 h-8 text-purple-400" />
              <Globe className="w-8 h-8 text-purple-300" />
              <Shapes className="w-8 h-8 text-purple-500" />
            </motion.div>

            <h1 className="text-6xl font-bold gradient-text">
              What do you want to build?
            </h1>
            <p className="text-xl text-purple-300 font-light">
              Transform your ideas into reality with AI-powered web development
            </p>
          </motion.div>

          {/* Input form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={fadeInUp}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TextInput
                id="prompt"
                type="text"
                sizing="lg"
                placeholder="Describe your dream website..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full rounded-xl text-center bg-transparent border-purple-500/30 text-purple-800 placeholder-purple-400/60"
              />
              <motion.div
                className="absolute inset-0 -z-10 rounded-xl"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(139, 92, 246, 0)",
                    "0 0 20px 2px rgba(139, 92, 246, 0.3)",
                    "0 0 0 0 rgba(139, 92, 246, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <motion.button
              type="submit"
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium text-lg overflow-hidden transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Website</span>
                </span>
              )}
            </motion.button>
          </motion.form>

          {/* Example prompts */}
          <motion.div className="space-y-4" variants={fadeInUp}>
            <motion.div
              className="flex items-center justify-center space-x-2 text-purple-400"
              variants={floatingIcons}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Try these examples</span>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={fadeInUp}
            >
              {examplePrompts.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-5 py-2.5 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-700/20 backdrop-blur-sm"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(139, 92, 246, 0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {example}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Dynamic gradient text animation */}
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .gradient-text {
          background: linear-gradient(45deg, #8b5cf6, #7c3aed, #6d28d9);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientAnimation 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;
