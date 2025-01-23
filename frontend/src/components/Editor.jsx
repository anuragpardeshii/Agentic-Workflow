import React, { useEffect } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const Editor = () => {
  useEffect(() => {
    StackBlitzSDK.embedProject(
      "stackblitz-container",
      {
        files: {
          "index.html": "<h1>Hello, World!</h1>",
          "index.js": "console.log('Hello, StackBlitz!');",
          "style.css": "body { font-family: Arial; }",
        },
        template: "javascript",
        title: "My Project",
      },
      {
        height: "100%",
      }
    );
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

export default Editor;
