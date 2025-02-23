import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion} from "framer-motion";
import { TextInput } from "flowbite-react";
import { Wand2, Sparkles, Code2, Globe, Shapes, LogOut } from "lucide-react";
import { generateResponse } from "../services/api";
import { useAuth } from "../components/AuthContext.jsx";
import Theme from "../components/Theme.jsx";

function AIHome() {
  const [prompt, setPrompt] = useState("");
  const [getResponse, setGetResponse] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    setIsLoading(true);

    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      setIsLoading(false);
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
      }
    } catch (error) {
      console.error("Error generating response:", error.message);
    } finally {
      setIsLoading(false);
      setGetResponse(localStorage.getItem("jsonData"));
    }
  };

  useEffect(() => {
    if (getResponse !== null) {
      navigate("/builder");
    } else if (window.location.href === "https://agentic-workflow-708v.onrender.com/ai") {
      localStorage.removeItem("prompt");
      localStorage.removeItem("jsonData");
      localStorage.removeItem("instructions");
      localStorage.removeItem("content");
      localStorage.removeItem("savedFiles");
    }
  }, [getResponse, navigate]);

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
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
      <Theme/>
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

      {/* Logout button */}
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 rounded-xl bg-purple-900/30 text-purple-300 border border-purple-700/20 backdrop-blur-sm"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(139, 92, 246, 0.2)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </motion.button>
      </div>

      {/* Main content */}
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
              Prompt, run, edit, and deploy full-stack web apps.
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
    </div>
  );
}

export default AIHome;
