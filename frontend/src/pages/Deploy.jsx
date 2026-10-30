import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import JSZip from "jszip";
import {
  Download,
  PackageCheck,
  ArrowLeft,
  ArrowRight,
  FileCode2,
  Check,
} from "lucide-react";
import PageIntro from "../components/PageIntro";
import Layout from "../components/Layout";
import { readProject } from "../lib/project";
export default function Deploy() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [method, setMethod] = useState("upload");
  const { state } = useLocation();
  const project = state?.project || readProject();
  const hasLockfile = Boolean(
    project?.files["package-lock.json"] || project?.files["/package-lock.json"],
  );
  async function download() {
    setBusy(true);
    setError("");
    try {
      const zip = new JSZip();
      for (const [path, file] of Object.entries(project.files)) {
        if (path.includes("..") || path.includes("\\"))
          throw new Error("Invalid file path");
        zip.file(path.replace(/^\//, ""), file.code);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.projectTitle || "project").replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <div className="product-page">
        <section className="landing-container export-page">
          <Link to="/builder" className="subtle-link">
            <ArrowLeft size={14} />
            Back to editor
          </Link>
          <PageIntro
            eyebrow="YOUR NEXT CHAPTER"
            title={
              <>
                Made by you.
                <br />
                <span>Ready to go further.</span>
              </>
            }
            description="Take your complete source code with you. Build, publish, and make a home for your website on your own terms."
          />
          <div className="export-grid">
            <div className="export-package">
              <div className="package-art">
                <PackageCheck size={58} strokeWidth={1} />
                <span>YOURS TO CREATE. YOURS TO KEEP.</span>
              </div>
              <div className="package-details">
                <span className="section-number">
                  COMPLETE PROJECT / ZIP ARCHIVE
                </span>
                <h2>{project?.projectTitle || "Your next project"}</h2>
                <p>
                  {project
                    ? `${Object.keys(project.files).length} source files, ready for your next step.`
                    : "Create a project to prepare your first export."}
                </p>
                {project && (
                  <div className="export-file-list">
                    {Object.keys(project.files)
                      .slice(0, 4)
                      .map((path) => (
                        <span key={path}>
                          <FileCode2 size={14} />
                          {path.replace(/^\//, "")}
                        </span>
                      ))}
                    {Object.keys(project.files).length > 4 && (
                      <small>
                        + {Object.keys(project.files).length - 4} more files
                      </small>
                    )}
                  </div>
                )}
                {project ? (
                  <button
                    onClick={download}
                    disabled={busy}
                    className="landing-button"
                  >
                    <Download size={16} />
                    {busy ? "Preparing…" : "Download source"}
                  </button>
                ) : (
                  <Link to="/ai" className="landing-button">
                    Create a project <ArrowRight size={16} />
                  </Link>
                )}
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="launch-guide">
              <p className="landing-kicker">A CLEAR PATH TO PUBLISHED</p>
              <h2>
                Three steps.
                <br />A world of possibility.
              </h2>
              <div className="launch-step">
                <span>01</span>
                <div>
                  <h3>Make it local.</h3>
                  <p>
                    Extract your archive and open a terminal in the project
                    folder.
                  </p>
                  <pre>
                    <code>
                      {hasLockfile ? "npm ci" : "npm install"}
                      {"\n"}npm run dev
                    </code>
                  </pre>
                </div>
              </div>
              <div className="launch-step">
                <span>02</span>
                <div>
                  <h3>Get ready for the world.</h3>
                  <p>
                    Review your website, check the details, and create a
                    production build. The in-app preview does not verify this
                    build; resolve any terminal errors before publishing.
                  </p>
                  <pre>
                    <code>npm run build</code>
                  </pre>
                </div>
              </div>
              <div className="launch-step">
                <span>03</span>
                <div>
                  <h3>Publish with Cloudflare Pages.</h3>
                  <p>
                    Start with the free plan and a <code>pages.dev</code>{" "}
                    address. Hosting quotas apply; a custom domain is optional.
                  </p>
                  <div
                    className="hosting-options"
                    role="group"
                    aria-label="Deployment method"
                  >
                    <button
                      type="button"
                      aria-pressed={method === "upload"}
                      onClick={() => setMethod("upload")}
                    >
                      Upload built files
                    </button>
                    <button
                      type="button"
                      aria-pressed={method === "git"}
                      onClick={() => setMethod("git")}
                    >
                      Connect Git
                    </button>
                  </div>
                  {method === "upload" ? (
                    <>
                      <p>
                        In your Cloudflare dashboard, create a Pages project
                        using Direct Upload. Upload the generated{" "}
                        <code>dist</code> folder, not the source ZIP, then open
                        the published URL.
                      </p>
                      <p>
                        A Direct Upload project cannot later switch to Git
                        integration; create a separate project if you change
                        methods.
                      </p>
                      <a
                        href="https://developers.cloudflare.com/pages/get-started/direct-upload/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Follow the upload guide ↗
                      </a>
                    </>
                  ) : (
                    <>
                      <p>
                        Push the extracted source to your own GitHub or GitLab
                        repository, then connect it in Cloudflare Pages. Set the
                        build command to <code>npm run build</code> and output
                        directory to <code>dist</code>. Review the build logs
                        and published URL.
                      </p>
                      <a
                        href="https://developers.cloudflare.com/pages/get-started/git-integration/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Follow the Git deployment guide ↗
                      </a>
                    </>
                  )}
                  <span className="launch-note">
                    <Check size={14} />
                    Guided setup · publishing happens in your hosting account.
                  </span>
                </div>
              </div>
              <p className="field-hint">
                Working with an older CRA project? Use <code>npm start</code>{" "}
                for development and publish the <code>build</code> folder.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
