import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import { updateProject } from "../services/response";

const Builder = () => {
  const storedPrompt = localStorage.getItem("prompt") || "";
  const [input, setInput] = useState(storedPrompt);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

        // Validate JSON before parsing
        const parsedJson = JSON.parse(jsonString);

        return {
          jsonData: parsedJson,
          instructions: instructions,
        };
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

      console.log(response.response.content);

      if (!response || !response.response.content) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("content", response.response.content);

      const parsedContent = separateJsonAndText(response.response.content);

      if (parsedContent) {
        localStorage.setItem("prompt", response.response.prompt);
        localStorage.setItem(
          "jsonData",
          JSON.stringify(parsedContent.jsonData)
        );
        localStorage.setItem("instructions", parsedContent.instructions);

        console.log("JSON Data:", parsedContent.jsonData);
        console.log("Instructions:", parsedContent.instructions);
      } else {
        console.log("No valid JSON found in content");
        setError("Invalid content format received");
      }

      setContent(localStorage.getItem("jsonData"));
    } catch (error) {
      console.error("Error generating content:", error);
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

  // Ensure parseJSON exists before rendering
  if (!parseJSON) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div
        style={{ width: "30%" }}
        className="bg-gray-900 border-r border-gray-800 flex flex-col relative"
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Instructions
          </h2>
          <div className="space-y-3">
            <div>
              <h4>{parseJSON.projectTitle}</h4>
            </div>

            <div>
              {instructions && (
                <div className="space-y-3">
                  {instructions.split("\n").map((line, index) => (
                    <p key={index} className="text-gray-300">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center bg-gray-950 rounded-lg border border-gray-800 p-2">
            <Play
              className={`w-4 h-4 mr-2 ${
                isLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-500 hover:text-white hover:cursor-pointer"
              }`}
              onClick={!isLoading ? generatingUpdatingContent : undefined}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-300 placeholder-gray-600"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {isLoading && (
            <p className="text-gray-400 text-sm mt-2">Generating content...</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 h-full bg-gray-950 overflow-hidden">
          <div className="h-full">
            <CodeEditor json={parseJSON} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
