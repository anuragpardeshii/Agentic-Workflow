import React, { useEffect } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const Editor = ({ fileNames }) => {
  useEffect(() => {
    if (!fileNames) return;
    const formattedFiles = Object.fromEntries(
      Object.entries(fileNames).map(([key, value]) => [
        key.startsWith("/") ? key.slice(1) : key,
        value.code,
      ])
    );

    StackBlitzSDK.embedProject(
      "stackblitz-container",
      {
        files: formattedFiles,
        template: "create-react-app",
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
