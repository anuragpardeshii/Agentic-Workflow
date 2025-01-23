import React, { useEffect, useState } from "react";
import { dracula } from "@codesandbox/sandpack-themes";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default function InteractiveEditor({ objForm }) {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const file = objForm.files;

  console.log(file);

  const keyFile = Object.keys(file);
  const valueFile = Object.values(file);

  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        const response = {
          data: {
            generatedFiles: keyFile.reduce(
              (acc, key, index) => ({
                ...acc,
                [key]: valueFile[index],
              }),
              {}
            ),
          },
        };

        // In a real app, replace the hardcoded response with an API call
        // const response = await axios.get("YOUR_BACKEND_ENDPOINT");

        setFiles(response.data.generatedFiles);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileStructure();
  }, []);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;

  return (
    <SandpackProvider
      template="react"
      theme={dracula}
      customSetup={{
        dependencies: {
          react: "latest",
          "react-dom": "latest",
          axios: "latest",
          "lucide-react": "latest",
          tailwindcss: "latest",
          "@codesandbox/sandpack-react": "latest",
        },
      }}
      files={files}
    >
      <SandpackLayout
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          overflow: "auto",
          margin: "20px",
        }}
      >
        <SandpackFileExplorer
          style={{ height: "100vh", overflowY: "scroll" }}
        />
        <SandpackCodeEditor closableTabs style={{ height: "100vh" }} />
        <SandpackPreview style={{ height: "100vh" }} theme={"dark"} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
