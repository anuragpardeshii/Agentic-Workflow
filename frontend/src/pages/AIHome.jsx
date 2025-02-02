import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput } from "flowbite-react";
import { Wand2, Sparkles } from "lucide-react";
import { generateResponse } from "../services/api";

function AIHome() {
  const [prompt, setPrompt] = useState("");
  const [getResponse, setGetResponse] = useState(null);
  const navigate = useNavigate();

  const examplePrompts = [
    "Build a modern blog with dark mode",
    "Design a landing page for a SaaS product",
    "Make an e-commerce store for artisanal coffee",
    "Create a personal photography showcase",
    "Create a portfolio website",
  ];

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
      navigate("/builder");
    } else if (window.location.href === "http://localhost:5173/ai") {
      localStorage.removeItem("prompt");
      localStorage.removeItem("jsonData");
      localStorage.removeItem("instructions");
      localStorage.removeItem("content");
    }
  }, [getResponse, navigate]);

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dot-pattern bg-dot-spacing opacity-70"></div>
      <div className="relative max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-purple-100">
            What do you want to build?
          </h1>
          <p className="font-inter text-purple-400 text-lg">
            Prompt, run, edit, and deploy full-stack web apps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <TextInput
              id="prompt"
              type="text"
              sizing="lg"
              placeholder="How can we help you today?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl text-center"
            />
            <Button
              type="submit"
              size="sm"
              color="purple"
              positionInGroup="middle"
              gradientMonochrome="purple"
              className="font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-purple-500 text-white px-6 py-3 rounded-md"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Website
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Try these examples</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800/50 text-purple-300 rounded-full text-sm border border-purple-700/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIHome;
