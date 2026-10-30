import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowUpRight, Plus, FolderOpen } from "lucide-react";
import PageIntro from "../components/PageIntro";
import Layout from "../components/Layout";
import AIConnectionSelect from "../components/AIConnectionSelect";
import { api, generateResponse } from "../services/api";
import { parseProject, saveProject } from "../lib/project";
const ideas = [
  "A portfolio for a creative studio",
  "A focused daily task planner",
  "A landing page for a coffee shop",
  "A personal reading tracker",
];
export default function AIHome() {
  const [connectionId, setConnectionId] = useState(undefined);
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(() =>
      (searchParams.get("prompt") || "").slice(0, 10000),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [projects, setProjects] = useState([]),
    [historyError, setHistoryError] = useState(""),
    [historyLoading, setHistoryLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    api("/responses")
      .then(setProjects)
      .catch((err) => setHistoryError(err.message))
      .finally(() => setHistoryLoading(false));
  }, []);
  const open = (response) => {
    try {
      const project = parseProject(response.content);
      saveProject(project);
      navigate("/builder");
    } catch (err) {
      setError(err.message);
    }
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      open(await generateResponse(prompt, connectionId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <div className="product-page">
        <section className="workspace-intro landing-container">
          <PageIntro
            eyebrow="YOUR CREATIVE WORKSPACE"
            title={
              <>
                A new day.
                <br className="mobile-break" /> <span>A new possibility.</span>
              </>
            }
            description="What would you create if getting started was the easy part?"
          />
          <div className="composer-wrap">
            <form onSubmit={submit} className="idea-composer" aria-busy={busy}>
              <div className="composer-label">
                <Sparkles size={17} />
                <label htmlFor="prompt">Describe your website</label>
              </div>
              <textarea
                id="prompt"
                placeholder="A website for that idea I can’t stop thinking about…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                minLength={3}
                maxLength={10000}
                disabled={busy}
              />
              <div className="composer-actions">
                <span>Start with the details. We’ll help with the rest.</span>
                <button
                  className="landing-button"
                  disabled={busy || connectionId === undefined}
                >
                  {busy ? "Creating your project…" : "Create project"}
                  <ArrowUpRight size={17} />
                </button>
              </div>
              <AIConnectionSelect
                value={connectionId}
                onChange={setConnectionId}
                disabled={busy}
              />
            </form>
            {busy && (
              <p role="status" className="progress-note">
                <span className="status-pulse" />
                Building your files. A local model can take a few minutes.
              </p>
            )}
            {error && (
              <p role="alert" className="error mt-4">
                {error}
              </p>
            )}
            <div className="idea-suggestions">
              <span>A LITTLE INSPIRATION</span>
              <div>
                {ideas.map((idea) => (
                  <button
                    key={idea}
                    disabled={busy}
                    onClick={() => {
                      setPrompt(idea);
                      document.getElementById("prompt")?.focus();
                    }}
                  >
                    <Plus size={12} />
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="landing-container project-section">
          <div className="section-heading-row">
            <div>
              <p className="landing-kicker">PICK UP THE THREAD</p>
              <h2>Your recent projects</h2>
            </div>
            <span className="quiet-count">
              {historyLoading
                ? "Loading…"
                : `${projects.length} recent ${projects.length === 1 ? "project" : "projects"}`}
            </span>
          </div>
          {historyError && (
            <p className="error" role="alert">
              {historyError}
            </p>
          )}
          {historyLoading && (
            <p role="status" className="empty-projects">
              Opening your collection…
            </p>
          )}
          <div className="project-collection">
            {projects.map((project, index) => (
              <button
                key={project._id}
                onClick={() => open(project)}
                className="project-item"
              >
                <div
                  className={`project-thumbnail thumbnail-${index % 3}`}
                  aria-hidden="true"
                >
                  <div className="mini-browser">
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>
                    <span />
                    <span />
                    <div className="mini-browser-blocks">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <ArrowUpRight size={20} />
                </div>
                <div className="project-item-details">
                  <h3>{project.prompt}</h3>
                  <span>
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
          {!historyLoading && !projects.length && !historyError && (
            <div className="empty-projects">
              <FolderOpen size={28} />
              <h3>A little space for your next big thing.</h3>
              <p>
                Your projects will find a home here. Start with an idea above.
              </p>
              <button
                className="landing-text-link"
                onClick={() => document.getElementById("prompt")?.focus()}
              >
                Create your first project <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
