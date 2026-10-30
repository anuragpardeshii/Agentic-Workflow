import { SandpackProvider } from "@codesandbox/sandpack-react";
import { useMemo, useState } from "react";
import SourceExplorer from "../features/builder/components/SourceExplorer";
import PreviewWorkspace from "../features/builder/components/PreviewWorkspace";
import { createPreview, normalizeFiles } from "../features/builder/lib/files";

export default function CodeEditor({ project, onChange, view, readOnly }) {
  const [files, setFiles] = useState(() => normalizeFiles(project.files));
  const preview = useMemo(() => createPreview(files), [files]);
  function changed(next) {
    setFiles(next);
    onChange(next);
  }
  return (
    <SandpackProvider
      template="react"
      files={preview.error ? {} : preview.files}
      customSetup={{ dependencies: preview.error ? {} : preview.dependencies }}
      options={{
        externalResources: [
          "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
        ],
        activeFile: `/${preview.app}`,
      }}
    >
      <div hidden={view !== "code"}>
        <SourceExplorer files={files} onChange={changed} readOnly={readOnly} />
      </div>
      <div hidden={view !== "preview"}>
        <PreviewWorkspace error={preview.error} />
      </div>
    </SandpackProvider>
  );
}
