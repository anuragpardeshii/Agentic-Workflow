import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import StackBlitzSDK from "@stackblitz/sdk";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = forwardRef(({ json, currentView, isExpanded }, ref) => {
  const [vmRef, setVmRef] = useState(null);
  const [currentFile, setCurrentFile] = useState("src/App.js");
  const [fileContent, setFileContent] = useState("");
  const [files, setFiles] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});

  useImperativeHandle(ref, () => ({
    getVm: () => vmRef,
    getCurrentFile: () => currentFile,
    getFiles: () => files,
    refreshFiles: (newFiles) => {
      // Completely replace the files with the new set
      setFiles(newFiles);
      
      // Check if current file exists in the new files
      if (newFiles[currentFile]) {
        setFileContent(newFiles[currentFile]);
      } else if (Object.keys(newFiles).length > 0) {
        const firstFile = Object.keys(newFiles)[0];
        setCurrentFile(firstFile);
        setFileContent(newFiles[firstFile]);
      }
      
      // If we have a VM, update it too
      if (vmRef) {
        // Get current files in VM
        vmRef.getFsSnapshot().then(snapshot => {
          const existingFiles = Object.keys(snapshot.files);
          const newFilePaths = Object.keys(newFiles).map(f => 
            f.startsWith('/') ? f : `/${f}`
          );
          
          // Determine which files to destroy (old files not in new set)
          const filesToDestroy = existingFiles.filter(f => 
            !newFilePaths.includes(f) && 
            !newFilePaths.includes(f.startsWith('/') ? f.slice(1) : `/${f}`)
          );
          
          // Apply the diff to VM
          vmRef.applyFsDiff({
            create: newFiles,
            destroy: filesToDestroy
          });
        });
      }
    }
  }));

  // Rest of your component remains the same...
  
  const formatFiles = (filesData) => {
    const formattedFiles = {};
    if (!filesData) return formattedFiles;
    
    Object.entries(filesData).forEach(([path, fileData]) => {
      const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
      formattedFiles[normalizedPath] = typeof fileData.code === "object" 
        ? JSON.stringify(fileData.code, null, 2) 
        : fileData.code;
    });
    return formattedFiles;
  };

  useEffect(() => {
    if (!json) return;
    
    try {
      const formattedFiles = formatFiles(json.files);
      const savedFiles = localStorage.getItem('savedFiles');
      let finalFiles = formattedFiles;
      
      if (savedFiles) {
        const parsedSavedFiles = JSON.parse(savedFiles);
        finalFiles = { ...formattedFiles, ...parsedSavedFiles };
      }
      
      setFiles(finalFiles);
      
      // Initialize expanded folders state
      const folderState = {};
      Object.keys(finalFiles).forEach(file => {
        const parts = file.split('/');
        if (parts.length > 1) {
          let path = '';
          for (let i = 0; i < parts.length - 1; i++) {
            path = path ? `${path}/${parts[i]}` : parts[i];
            folderState[path] = true; // Default to expanded
          }
        }
      });
      setExpandedFolders(folderState);
      
      if (finalFiles["src/App.js"]) {
        setCurrentFile("src/App.js");
        setFileContent(finalFiles["src/App.js"]);
      } else if (Object.keys(finalFiles).length > 0) {
        const firstFile = Object.keys(finalFiles)[0];
        setCurrentFile(firstFile);
        setFileContent(finalFiles[firstFile]);
      }

      StackBlitzSDK.embedProject(
        "stackblitz-container",
        {
          files: finalFiles,
          template: "create-react-app",
          title: json.projectTitle || "React App",
          description: json.explanation || "React Application",
        },
        {
          height: "100%",
          openFile: "src/App.js",
        }
      ).then(vm => setVmRef(vm));
    } catch (error) {
      console.error("Error setting up editors:", error);
    }
  }, [json]);

  const handleEditorChange = (newValue) => {
    setFileContent(newValue);
    const updatedFiles = { ...files, [currentFile]: newValue };
    setFiles(updatedFiles);
    localStorage.setItem('savedFiles', JSON.stringify(updatedFiles));
    
    if (vmRef) {
      const update = {};
      update[currentFile] = newValue;
      vmRef.applyFsDiff({ create: update, destroy: [] });
    }
    
    try {
      const currentJsonData = JSON.parse(localStorage.getItem("jsonData") || "{}");
      if (currentJsonData?.files) {
        const pathWithSlash = "/" + currentFile.replace(/^\//, "");
        currentJsonData.files[pathWithSlash] = { code: newValue };
        localStorage.setItem("jsonData", JSON.stringify(currentJsonData));
      }
    } catch (error) {
      console.error("Error updating jsonData:", error);
    }
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return '📄';
      case 'ts': case 'tsx': return '📄';
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'json': return '⚙️';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const renderFileTree = () => {
    const fileStructure = {};
    
    // Build file structure
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      let current = fileStructure;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      const fileName = parts[parts.length - 1];
      current[fileName] = null; // Null indicates it's a file, not a folder
    });
    
    const renderFolder = (structure, path = '') => {
      return Object.keys(structure).map(name => {
        const fullPath = path ? `${path}/${name}` : name;
        
        if (structure[name] === null) {
          // It's a file
          return (
            <div 
              key={fullPath}
              className={`pl-4 py-1 cursor-pointer hover:bg-purple-800/30 ${currentFile === fullPath ? 'bg-purple-800/50 border-l-2 border-purple-400' : ''}`}
              onClick={() => {
                setCurrentFile(fullPath);
                setFileContent(files[fullPath]);
              }}
            >
              <span className="mr-2 text-white">{getFileIcon(name)}</span>
              <span className="text-purple-100">{name}</span>
            </div>
          );
        } else {
          // It's a folder
          const isExpanded = expandedFolders[fullPath];
          return (
            <div key={fullPath}>
              <div 
                className="pl-2 py-1 cursor-pointer hover:bg-purple-800/30 flex items-center"
                onClick={() => toggleFolder(fullPath)}
              >
                <span className="mr-2">{isExpanded ? '📂' : '📁'}</span>
                {name}
                <span className="ml-auto mr-2">{isExpanded ? '▼' : '▶'}</span>
              </div>
              {isExpanded && (
                <div className="ml-4 border-l border-purple-600/30">
                  {renderFolder(structure[name], fullPath)}
                </div>
              )}
            </div>
          );
        }
      });
    };
    
    return (
      <div className="text-sm overflow-y-auto h-full bg-purple-900/10 border-r border-purple-500/20">
        {renderFolder(fileStructure)}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className={`h-full ${currentView === "preview" ? "block" : "hidden"}`}>
        <div id="stackblitz-container" className="w-full h-full" />
      </div>
      
      <div className={`h-full ${currentView === "editor" ? "flex flex-col" : "hidden"}`}>
        <div className="p-2 bg-purple-900/20 border-b border-purple-500/20">
          <div className="text-purple-200 font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
            {currentFile}
          </div>
        </div>
        <div className="flex flex-1 h-[calc(100%-40px)]">
          <div className="w-64 h-full">
            {renderFileTree()}
          </div>
          <div className="flex-1 h-full">
            <MonacoEditor
              height="100%"
              language={getLanguage(currentFile)}
              theme="vs-dark"
              value={fileContent}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CodeEditor;