import React, { useEffect } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const CodeEditor = ({ json }) => {
  useEffect(() => {
    if (!json) return;
    const formatFiles = (filesData) => {
      const formattedFiles = {};

      Object.entries(filesData).forEach(([path, fileData]) => {
        const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
        formattedFiles[normalizedPath] = fileData.code;
      });

      return formattedFiles;
    };

    try {
      const files = formatFiles(json.files);

      StackBlitzSDK.embedProject(
        "stackblitz-container",
        {
          files: files,
          template: "create-react-app",
          title: json.projectTitle || "React Todo App",
          description: json.explanation || "A React Todo Application",
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            tailwindcss: "^3.0.0",
            "lucide-react": "^0.474.0",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            "@types/react-router-dom": "^7.1.4",
          },
        },
        {
          height: "100%",
          openFile: "src/App.js",
        }
      );
    } catch (error) {
      console.error("Error setting up StackBlitz:", error);
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <div
        id="stackblitz-container"
        style={{ height: "600px", width: "100%" }}
      ></div>
    </div>
  );
};

export default CodeEditor;
