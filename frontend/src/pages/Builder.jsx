import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  Monitor,
  Code2,
  Check,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import AIConnectionSelect from "../components/AIConnectionSelect";
import CodeEditor from "../components/CodeEditor";
import { readProject, saveProject, parseProject } from "../lib/project";
import { updateProject } from "../services/response";
export default function Builder() {
  const navigate = useNavigate();
  const [connectionId, setConnectionId] = useState(undefined);
  const [project, setProject] = useState(readProject),
    [prompt, setPrompt] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saveError, setSaveError] = useState(false),
    [view, setView] = useState("preview"),
    [revision, setRevision] = useState(0);
  const current = useRef(project);
  const changed = useCallback((files) => {
    if (!current.current) return;
    current.current = { ...current.current, files };
    try {
      saveProject(current.current);
      setSaveError(false);
    } catch {
      setSaveError(true);
      setError("Browser storage is full. Export your project before leaving.");
    }
  }, []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await updateProject({
        prompt,
        connectionId,
        previousContent: JSON.stringify(current.current),
      });
      const next = parseProject(result.response.content);
      saveProject(next);
      setSaveError(false);
      current.current = next;
      setProject(next);
      setRevision((v) => v + 1);
      setPrompt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (!project)
    return (
      <Layout>
        <section className="product-page empty-editor landing-container">
          <span className="soft-icon">
            <Sparkles size={28} />
          </span>
          <p className="landing-kicker">ROOM FOR POSSIBILITY</p>
          <h1>Your canvas is ready.</h1>
          <p>
            Create a project or open one from your workspace to start shaping
            the details.
          </p>
          <Link to="/ai" className="landing-button">
            Open your workspace <ArrowRight size={17} />
          </Link>
        </section>
      </Layout>
    );
  return (
    <Layout footer={false}>
      <div className="product-page editor-page">
        <header className="editor-heading">
          <div>
            <Link to="/ai" className="subtle-link">
              <ArrowLeft size={14} />
              Workspace
            </Link>
            <h1>{project.projectTitle || "Untitled project"}</h1>
          </div>
          <Link
            to="/deploy"
            className="landing-button"
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              navigate("/deploy", { state: { project: current.current } });
            }}
          >
            Export project <ArrowUpRight size={16} />
          </Link>
        </header>
        <div className="editor-workbench">
          <aside className="editor-partner">
            <p className="partner-label">
              <Sparkles size={17} />
              YOUR BUILD PARTNER
            </p>
            <div className="partner-summary">
              <span className="section-number">
                A FIRST STEP. A NEXT CHAPTER.
              </span>
              <h2>Keep the ideas coming.</h2>
              <p>
                {project.explanation || "Your project is ready to explore."}
              </p>
            </div>
            <form
              className="product-form refinement-form"
              onSubmit={submit}
              aria-busy={busy}
            >
              <label className="field">
                What’s next?
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A softer palette. A bolder headline. Something more you…"
                  required
                  minLength={3}
                  maxLength={10000}
                  disabled={busy}
                />
              </label>
              <AIConnectionSelect
                value={connectionId}
                onChange={setConnectionId}
                disabled={busy}
              />
              <button
                className="landing-button"
                disabled={busy || connectionId === undefined}
              >
                {busy ? "Updating…" : "Update project"}
                <ArrowUpRight size={16} />
              </button>
            </form>
            {busy && (
              <p className="progress-note" role="status">
                Refining your project…
              </p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </aside>
          <section
            className="editor-canvas"
            aria-label="Project preview and source"
          >
            <div className="editor-toolbar">
              <div className="editor-switch">
                {["preview", "code"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setView(tab)}
                    aria-pressed={tab === view}
                  >
                    {tab === "preview" ? (
                      <Monitor size={14} />
                    ) : (
                      <Code2 size={14} />
                    )}
                    <span>
                      {tab === "preview" ? "Preview" : "Files & code"}
                    </span>
                  </button>
                ))}
              </div>
              <span className="save-note">
                <Check size={13} />
                {saveError ? "Changes not saved" : "Saved in this session"}
              </span>
            </div>
            <CodeEditor
              key={revision}
              project={project}
              onChange={changed}
              view={view}
              readOnly={busy}
            />
          </section>
        </div>
        <p className="editor-footnote">
          Your ideas. Your source. A little more you with every edit.
        </p>
      </div>
    </Layout>
  );
}
