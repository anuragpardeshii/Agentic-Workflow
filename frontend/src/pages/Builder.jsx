import React, { useState, useEffect } from "react";
import { Play, Bot, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { updateProject } from "../services/response";
import Theme from "../components/Theme";

const Builder = () => {
  const storedPrompt = localStorage.getItem("prompt") || "";
  const [input, setInput] = useState(storedPrompt);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshEditor, setRefreshEditor] = useState(false);

  const jsonData = localStorage.getItem("jsonData");
  const parseJSON = jsonData ? JSON.parse(jsonData) : null;
  const instructions = localStorage.getItem("instructions");
  const prevContent = localStorage.getItem("content") || "";
  const location = window.location.href;

  const separateJsonAndText = (content) => {
    if (!content || typeof content !== "string") {
      console.error("Invalid content provided to separateJsonAndText");
      return null;
    }

    try {
      const jsonRegex = /```json\s*({[\s\S]*?})\s*```/;
      const match = content.match(jsonRegex);

      if (match && match[1]) {
        const jsonString = match[1];
        const instructions = content.replace(match[0], "").trim();
        const parsedJson = JSON.parse(jsonString);
        return { jsonData: parsedJson, instructions: instructions };
      }

      console.log("No JSON pattern found in content");
      return null;
    } catch (error) {
      console.error("Error parsing content:", error);
      return null;
    }
  };

  const generatingUpdatingContent = async () => {
    if (!input.trim()) {
      setError("Prompt cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateProject({
        prompt: input,
        previousContent: prevContent,
      });

      if (!response || !response.response.content) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("content", response.response.content);
      const parsedContent = separateJsonAndText(response.response.content);

      if (parsedContent) {
        localStorage.setItem("prompt", response.response.prompt);
        localStorage.setItem("jsonData", JSON.stringify(parsedContent.jsonData));
        localStorage.setItem("instructions", parsedContent.instructions);
      } else {
        setError("Invalid content format received");
      }

      setContent(localStorage.getItem("jsonData"));
      setRefreshEditor((prev) => !prev);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to generate content"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      generatingUpdatingContent();
    }
  };

  useEffect(() => {
    if (location === "http://localhost:5173/ai") {
      localStorage.removeItem("prompt");
      localStorage.removeItem("jsonData");
      localStorage.removeItem("instructions");
      localStorage.removeItem("content");
    }
  }, []);

  if (!parseJSON) {
    return (
      <div className="min-h-screen bg-[#0A0118] flex items-center justify-center">
        <div className="text-purple-200 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0118]">
      <Theme/>
      <div className="relative flex w-full">
        <div className="w-[30%] border-r border-purple-500/20 flex flex-col">
          {/* Header with animated logo and deploy button */}
          <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
            <Link to="/ai" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bot className="w-8 h-8 text-purple-400" />
              </motion.div>
              <span className="text-xl font-bold text-white">bolt.old</span>
            </Link>
            
            <Link 
              to="/deploy" 
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition-colors duration-200"
            >
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Deploy</span>
            </Link>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-sm font-medium text-purple-200 mb-4">
              Instructions
            </h2>
            <div className="space-y-3">
              <div>
                <h4 className="text-white">{parseJSON.projectTitle}</h4>
              </div>
              <div>
                {instructions && (
                  <div className="space-y-3">
                    {instructions.split("\n").map((line, index) => (
                      <p key={index} className="text-purple-200">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-purple-500/20">
            <div className="flex items-center bg-purple-900/20 rounded-xl border border-purple-500/20 p-2">
              <Play
                className={`w-4 h-4 mr-2 ${
                  isLoading
                    ? "text-purple-400 cursor-not-allowed"
                    : "text-purple-500 hover:text-purple-200 hover:cursor-pointer"
                }`}
                onClick={!isLoading ? generatingUpdatingContent : undefined}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none focus:outline-none text-purple-200 placeholder-purple-500"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {isLoading && (
              <p className="text-purple-400 text-sm mt-2">Generating content...</p>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="h-full bg-[#0A0118]">
            <CodeEditor key={refreshEditor} json={parseJSON} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;