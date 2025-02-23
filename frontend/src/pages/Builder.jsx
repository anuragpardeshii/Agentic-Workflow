import React, { useState, useRef } from "react";
import { Play, Bot, Rocket, RefreshCw, Maximize2, Minimize2, Code, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { updateProject } from "../services/response";
import Theme from "../components/Theme";

const Builder = () => {
  const [input, setInput] = useState(localStorage.getItem("prompt") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshEditor, setRefreshEditor] = useState(false);
  const [currentView, setCurrentView] = useState("preview");
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef(null);

  const parseJSON = localStorage.getItem("jsonData") ? JSON.parse(localStorage.getItem("jsonData")) : null;
  const instructions = localStorage.getItem("instructions");
  const prevContent = localStorage.getItem("content") || "";

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

      if (!response?.response.content) throw new Error("Invalid response");

      localStorage.setItem("content", response.response.content);
      const parsedContent = separateJsonAndText(response.response.content);

      if (parsedContent) {
        localStorage.setItem("prompt", response.response.prompt);
        localStorage.setItem("jsonData", JSON.stringify(parsedContent.jsonData));
        localStorage.setItem("instructions", parsedContent.instructions);
        
        // Clear local storage saved files to ensure we use the new files
        localStorage.removeItem('savedFiles');
        
        if (editorRef.current?.refreshFiles) {
          const formattedFiles = {};
          Object.entries(parsedContent.jsonData.files).forEach(([path, fileData]) => {
            const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
            formattedFiles[normalizedPath] = typeof fileData.code === "object" 
              ? JSON.stringify(fileData.code, null, 2) 
              : fileData.code;
          });
          editorRef.current.refreshFiles(formattedFiles);
        }
      } else {
        setError("Invalid content format");
      }

      setRefreshEditor(prev => !prev);
    } catch (error) {
      setError(error.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompile = () => {
    if (!editorRef.current?.getVm()) {
      setError("Preview not ready");
      return;
    }

    try {
      const vm = editorRef.current.getVm();
      const files = editorRef.current.getFiles();
      
      vm.getFsSnapshot().then(snapshot => {
        const existingFiles = Object.keys(snapshot.files);
        const currentFiles = Object.keys(files).map(f => f.startsWith('/') ? f : `/${f}`);
        const filesToDestroy = existingFiles.filter(f => 
          !currentFiles.includes(f) && 
          !currentFiles.includes(f.startsWith('/') ? f.slice(1) : `/${f}`)
        );
        
        const filesToCreate = {};
        Object.entries(files).forEach(([path, content]) => {
          filesToCreate[path] = content;
        });
        
        vm.applyFsDiff({
          create: filesToCreate,
          destroy: filesToDestroy
        });
        
        const currentJsonData = JSON.parse(localStorage.getItem("jsonData") || "{}");
        if (currentJsonData?.files) {
          currentJsonData.files = {};
          Object.entries(files).forEach(([path, content]) => {
            const pathWithSlash = "/" + path.replace(/^\//, "");
            currentJsonData.files[pathWithSlash] = { code: content };
          });
          localStorage.setItem("jsonData", JSON.stringify(currentJsonData));
        }
        
        localStorage.setItem("savedFiles", JSON.stringify(files));
      });
    } catch (error) {
      setError("Compilation failed");
    }
  };

  if (!parseJSON) {
    return (
      <div className="min-h-screen bg-[#0A0118] flex items-center justify-center">
        <div className="text-purple-200 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0118]">
      <Theme />
      <div className="relative flex w-full p-4 gap-4">
        <motion.div 
          className="w-[30%] flex flex-col bg-[#0A0118]/90 backdrop-blur-lg rounded-xl border border-purple-500/20"
          animate={{ width: isExpanded ? "0%" : "30%" }}
        >
          <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
            <Link to="/ai" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bot className="w-8 h-8 text-purple-400" />
              </motion.div>
              <span className="text-xl font-bold text-white">BuildFast.new</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-medium text-purple-200 mb-4">Instructions</h2>
            {instructions && (
              <div className="space-y-3 text-purple-200">
                {instructions.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-purple-500/20">
            <div className="flex items-center bg-purple-900/20 rounded-xl border border-purple-500/20 p-2">
              <Play 
                className={`w-4 h-4 mr-2 ${isLoading ? "text-purple-400" : "text-purple-500 hover:text-purple-200 cursor-pointer"}`}
                onClick={!isLoading ? generatingUpdatingContent : undefined}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && generatingUpdatingContent()}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none focus:outline-none text-purple-200 placeholder-purple-500"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {isLoading && <p className="text-purple-400 text-sm mt-2">Generating content...</p>}
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 relative"
          animate={{ width: isExpanded ? "100%" : "70%" }}
        >
          {/* Fixed Header with Actions */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 z-10 bg-[#0A0118]/60 backdrop-blur-sm rounded-t-xl">
            <div className="flex gap-2">
              <button 
                onClick={handleCompile}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded-lg border border-purple-500/20"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Compile</span>
              </button>
              <Link 
                to="/deploy" 
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded-lg border border-purple-500/20"
              >
                <Rocket className="w-4 h-4" />
                <span>Deploy</span>
              </Link>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentView(v => v === "preview" ? "editor" : "preview")} 
                className="icon-btn"
                title={currentView === "preview" ? "Switch to Editor" : "Switch to Preview"}
              >
                {currentView === "preview" ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="icon-btn"
                title={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="h-full bg-[#0A0118]/90 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
            <div className="h-full pt-12"> {/* Added padding top to account for header */}
              <CodeEditor 
                key={refreshEditor} 
                json={parseJSON} 
                ref={editorRef}
                currentView={currentView}
                isExpanded={isExpanded}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Builder;