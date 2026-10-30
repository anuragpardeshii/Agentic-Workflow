import { useMemo, useState } from "react";
import { CodeEditor as SourceEditor } from "@codesandbox/sandpack-react";
import { FileCode2, Folder, Plus, Pencil, Trash2 } from "lucide-react";
import { entryFiles, fileTree, validateFilePath } from "../lib/files";

function Directory({ node, active, onSelect }) {
  const children = [...node.children.values()].sort(
    (a, b) =>
      Number(Boolean(b.children.size)) - Number(Boolean(a.children.size)) ||
      a.name.localeCompare(b.name),
  );
  return (
    <ul>
      {children.map((child) => (
        <li key={child.path}>
          {child.children.size ? (
            <details open>
              <summary>
                <Folder size={14} />
                {child.name}
              </summary>
              <Directory node={child} active={active} onSelect={onSelect} />
            </details>
          ) : (
            <button
              type="button"
              title={child.path}
              aria-current={active === child.path ? "true" : undefined}
              onClick={() => onSelect(child.path)}
            >
              <FileCode2 size={14} />
              <span>{child.name}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function SourceExplorer({ files, onChange, readOnly }) {
  const [selected, setSelected] = useState(
    files["src/App.jsx"] ? "src/App.jsx" : Object.keys(files)[0],
  );
  const active = files[selected] ? selected : Object.keys(files)[0];
  const [operation, setOperation] = useState(null);
  const [path, setPath] = useState("");
  const [error, setError] = useState("");
  const tree = useMemo(() => fileTree(files), [files]);
  function start(action) {
    setOperation(action);
    setPath(action === "rename" ? active : "");
    setError("");
  }
  function save(event) {
    event.preventDefault();
    if (readOnly) return;
    try {
      const next = { ...files };
      if (operation === "delete") {
        delete next[active];
        onChange(next);
        setSelected(Object.keys(next)[0]);
      } else {
        const name = validateFilePath(
          path,
          files,
          operation === "rename" ? active : undefined,
        );
        const file = operation === "rename" ? files[active] : { code: "" };
        if (operation === "rename") delete next[active];
        next[name] = file;
        onChange(next);
        setSelected(name);
      }
      setOperation(null);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="source-workspace">
      <nav className="source-tree" aria-label="Project files">
        <div className="source-tree-heading">
          <strong>Files</strong>
          <button
            type="button"
            aria-label="New file"
            onClick={() => start("new")}
            disabled={readOnly}
          >
            <Plus size={16} />
          </button>
        </div>
        <Directory
          node={tree}
          active={active}
          onSelect={(name) => {
            setSelected(name);
            setOperation(null);
          }}
        />
      </nav>
      <div className="source-document">
        <div className="source-path">
          <span title={active}>{active}</span>
          <div>
            <button
              type="button"
              aria-label="Rename file"
              onClick={() => start("rename")}
              disabled={readOnly || entryFiles.has(active)}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              aria-label="Delete file"
              onClick={() => start("delete")}
              disabled={
                readOnly ||
                entryFiles.has(active) ||
                Object.keys(files).length === 1
              }
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {operation && (
          <form className="source-file-form" onSubmit={save}>
            {operation === "delete" ? (
              <p>
                Delete <strong>{active}</strong>? This cannot be undone.
              </p>
            ) : (
              <label>
                {operation === "new" ? "New file path" : "Rename file path"}
                <input
                  autoFocus
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="src/components/Header.jsx"
                  required
                  disabled={readOnly}
                />
              </label>
            )}
            {operation === "rename" && (
              <p>
                Update any imports that reference this file after renaming it.
              </p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <div>
              <button className="landing-button" disabled={readOnly}>
                {operation === "delete" ? "Confirm delete" : "Save file"}
              </button>
              <button type="button" onClick={() => setOperation(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <SourceEditor
          key={active}
          code={files[active]?.code || ""}
          filePath={active}
          initMode="immediate"
          showLineNumbers
          wrapContent
          readOnly={readOnly}
          onCodeUpdate={(code) => {
            if (!readOnly && code !== files[active]?.code)
              onChange({ ...files, [active]: { code } });
          }}
        />
      </div>
    </div>
  );
}
