import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  ChevronRight,
  ChevronDown,
  Code2,
  Eye,
  FolderTree,
  Terminal,
  Play,
} from "lucide-react";

const Builder = () => {
  const [selectedTool, setSelectedTool] = useState("code");
  const [expandedFolders, setExpandedFolders] = useState(["src"]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState("src/App.tsx");
  const [draggingPanel, setDraggingPanel] = useState(null);
  const [editorContent, setEditorContent] = useState(`import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <h1>Welcome to Modern Builder</h1>
    </div>
  );
};

export default App;`);

  const [panelSizes, setPanelSizes] = useState({
    instructions: 240,
    explorer: 240,
  });

  const fileStructure = [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "components",
          type: "folder",
          children: [
            {
              name: "Header.tsx",
              type: "file",
              path: "src/components/Header.tsx",
            },
            {
              name: "Footer.tsx",
              type: "file",
              path: "src/components/Footer.tsx",
            },
          ],
        },
        { name: "App.tsx", type: "file", path: "src/App.tsx" },
        { name: "main.tsx", type: "file", path: "src/main.tsx" },
        { name: "styles.css", type: "file", path: "src/styles.css" },
      ],
    },
    { name: "package.json", type: "file", path: "package.json" },
    { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
  ];

  const tools = [
    { id: "code", icon: Code2, label: "Code" },
    { id: "preview", icon: Eye, label: "Preview" },
    { id: "terminal", icon: Terminal, label: "Terminal" },
  ];

  const instructions = [
    "1. Initialize your project by selecting a template",
    "2. Choose your preferred framework and styling solution",
    "3. Create components in the src/components directory",
    "4. Modify App.tsx to include your components",
    "5. Style your application using the provided CSS utilities",
    "6. Preview your changes in real-time",
    "7. Use the terminal for package management and builds",
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingPanel) return;

      e.preventDefault();
      setPanelSizes((prev) => ({
        ...prev,
        [draggingPanel]: Math.max(160, Math.min(480, e.clientX - 60)),
      }));
    };

    const handleMouseUp = () => {
      setDraggingPanel(null);
    };

    if (draggingPanel) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingPanel]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  const getLanguage = (filename) => {
    const ext = filename.split(".").pop();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "css":
        return "css";
      case "json":
        return "json";
      default:
        return "typescript";
    }
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName)
        ? prev.filter((name) => name !== folderName)
        : [...prev, folderName]
    );
  };

  const handleFileClick = (path) => {
    setSelectedFile(path);
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item) => (
      <div
        key={item.path || item.name}
        className={`ml-${depth * 4} py-1 text-sm`}
      >
        {item.type === "folder" ? (
          <div>
            <button
              onClick={() => toggleFolder(item.name)}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              <FolderTree className="w-4 h-4 mr-2 text-blue-400" />
              {item.name}
            </button>
            {expandedFolders.includes(item.name) && item.children && (
              <div className="mt-1">
                {renderFileTree(item.children, depth + 1)}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleFileClick(item.path)}
            className={`flex items-center ml-5 w-full text-left rounded px-2 py-1 transition-colors duration-200
              ${
                selectedFile === item.path
                  ? "text-white bg-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <Code2 className="w-4 h-4 mr-2 text-gray-500" />
            {item.name}
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left Sidebar - Tools */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSelectedTool(id)}
            className={`p-3 rounded-lg transition-all duration-200 group relative
              ${
                selectedTool === id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions Panel */}
      <div
        style={{ width: `${panelSizes.instructions}px` }}
        className="bg-gray-900 border-r border-gray-800 flex flex-col relative"
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Instructions
          </h2>
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <p key={index} className="text-sm text-gray-300">
                {instruction}
              </p>
            ))}
          </div>
        </div>
        <div
          className="absolute top-0 bottom-0 right-0 w-1 cursor-col-resize bg-gray-800 hover:bg-blue-500/50"
          onMouseDown={() => setDraggingPanel("instructions")}
        />
      </div>

      {/* File Explorer */}
      <div
        style={{ width: `${panelSizes.explorer}px` }}
        className="bg-gray-900 border-r border-gray-800 flex flex-col relative"
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Explorer</h2>
          {renderFileTree(fileStructure)}
        </div>
        <div
          className="absolute top-0 bottom-0 right-0 w-1 cursor-col-resize bg-gray-800 hover:bg-blue-500/50"
          onMouseDown={() => setDraggingPanel("explorer")}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Area */}
        <div className="flex-1 bg-gray-950">
          <Editor
            height="100%"
            defaultLanguage={getLanguage(selectedFile)}
            value={editorContent}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontFamily: "monospace",
              lineNumbers: "on",
              roundedSelection: false,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
              },
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />
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
    </div>
  );
};

export default Builder;
