import React from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const Editor = () => {
  React.useEffect(() => {
    StackBlitzSDK.embedProject("stackblitz-container", {
      files: {
        "index.html": "<h1>Hello, World!</h1>",
        "index.js": "console.log('Hello, StackBlitz!');",
        "style.css": "body { font-family: Arial; }",
      },
      template: "javascript",
      title: "My Project",
    });
  }, []);

  return (
    <div>
      <div
        id="stackblitz-container"
        style={{ height: "1000px", width: "100%" }}
      ></div>
    </div>
  );
};

export default Editor;
