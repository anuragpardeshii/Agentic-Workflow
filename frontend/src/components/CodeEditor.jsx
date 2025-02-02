import React, { useEffect } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const CodeEditor = ({ json }) => {
  useEffect(() => {
    if (!json) return;
    const formatFiles = (filesData) => {
      const formattedFiles = {};

      Object.entries(filesData).forEach(([path, fileData]) => {
        const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

        // Convert objects to JSON strings to ensure uniform data storage
        formattedFiles[normalizedPath] =
          typeof fileData.code === "object"
            ? JSON.stringify(fileData.code, null, 2)
            : fileData.code;
      });

      return formattedFiles;
    };

    try {
      const files = formatFiles(json.files);
      console.log(files);

      StackBlitzSDK.embedProject(
        "stackblitz-container",
        {
          files: files,
          template: "create-react-app",
          title: json.projectTitle || "React Todo App",
          description: json.explanation || "A React Todo Application",
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
