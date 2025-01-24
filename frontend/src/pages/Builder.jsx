import React, { useState, useEffect } from "react";
// import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import Editor from "../components/Editor";
import { useLocation } from "react-router-dom";

const Builder = () => {
  const [input, setInput] = useState("");

  const location = useLocation();

  const getResponse = location.state;

  let builderData = getResponse[1]
    .replace(/json|/g, "")
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

  const objForm = JSON.parse(builderData);

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Instructions Panel */}
      <div
        style={{ width: "auto" }}
        className="bg-gray-900 border-r border-gray-800 flex flex-col relative"
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Instructions
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-300">{objForm.projectTitle}</p>
            {objForm.explanation?.split(".").map((line) => (
              <p className="text-sm">{line}</p>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center bg-gray-950 rounded-lg border border-gray-800 p-2">
            <Play className="w-4 h-4 text-gray-500 mr-2" />
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
            <Editor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
