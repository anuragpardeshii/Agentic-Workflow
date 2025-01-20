import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput } from "flowbite-react";
import { Wand2, Sparkles } from "lucide-react";

function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const examplePrompts = [
    "Build a modern blog with dark mode",
    "Design a landing page for a SaaS product",
    "Make an e-commerce store for artisanal coffee",
    "Create a personal photography showcase",
    "Create a portfolio website",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

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

export default Home;
