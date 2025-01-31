import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import CodeEditor from "../components/CodeEditor";

const Builder = () => {
  const prompt = localStorage.getItem("prompt");
  const [input, setInput] = useState(prompt);

  const jsonData = localStorage.getItem("jsonData");
  const parseJSON = JSON.parse(jsonData);

  const instructions = localStorage.getItem("instructions");

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

        {/* Command Input */}

        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center bg-gray-950 rounded-lg border border-gray-800 p-2">
            <Play className="w-4 h-4 text-gray-500 mr-2 hover:text-white hover:cursor-pointer" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-300 placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Area */}
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
