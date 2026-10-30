import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Code2,
  Monitor,
  MousePointer2,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
const concepts = {
  studio: {
    label: "Creative studio",
    name: "form & field",
    title: (
      <>
        Spaces for
        <br />a slower life.
      </>
    ),
    description:
      "Thoughtful spaces. Natural materials. A different way to feel at home.",
    prompt: "Create a warm, minimal website for an architecture studio.",
    color: "#e9e4da",
  },
  portfolio: {
    label: "Portfolio",
    name: "alex morgan®",
    title: (
      <>
        A fresh way
        <br />
        to see things.
      </>
    ),
    description:
      "Independent designer. Curious thinker. Making the everyday a little extraordinary.",
    prompt: "Build an editorial portfolio for an independent designer.",
    color: "#e3e9e2",
  },
  product: {
    label: "Product launch",
    name: "gather.",
    title: (
      <>
        Good things.
        <br />
        Better together.
      </>
    ),
    description:
      "A calmer place for your team to think, plan, and make something meaningful.",
    prompt: "Design a clean landing page for a team collaboration app.",
    color: "#e7e2ee",
  },
};
export default function WebsiteDemo() {
  const [concept, setConcept] = useState("studio");
  const [view, setView] = useState("preview");
  const site = concepts[concept];
  return (
    <div
      className="website-demo"
      aria-label="Interactive website builder demonstration"
    >
      <div className="demo-chrome">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="demo-project-name">
          Your next big idea <span>/</span> Website
        </span>
        <span className="demo-label">Interactive demo</span>
      </div>
      <div className="demo-workspace">
        <aside className="demo-assistant">
          <div className="demo-assistant-title">
            <Sparkles size={18} /> Let’s make it happen
          </div>
          <p className="demo-message" key={concept}>
            {site.prompt}
          </p>
          <div className="demo-response">
            <span className="demo-spark">
              <Sparkles size={16} />
            </span>
            <p>
              A little space. A clear point of view. Here’s a starting point for
              your next chapter.
            </p>
          </div>
          <div className="demo-checks">
            {[
              "Responsive layout",
              "Thoughtful details",
              "Editable source code",
            ].map((item) => (
              <span key={item}>
                <Check size={14} />
                {item}
              </span>
            ))}
          </div>
          <div className="demo-prompt">
            <span>Where should we go next?</span>
            <Link to="/ai" aria-label="Start your own website">
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </aside>
        <div className="demo-preview">
          <div className="preview-toolbar">
            <div className="demo-view-switch" aria-label="Demo view">
              <button
                onClick={() => setView("preview")}
                aria-pressed={view === "preview"}
              >
                <Monitor size={13} /> Preview
              </button>
              <button
                onClick={() => setView("code")}
                aria-pressed={view === "code"}
              >
                <Code2 size={13} /> Code
              </button>
            </div>
            <span className="preview-address">your-next-idea /</span>
            <Link to="/ai" className="demo-export">
              Make it yours <ArrowUpRight size={12} />
            </Link>
          </div>
          {view === "preview" ? (
            <div
              className={`sample-site sample-${concept}`}
              style={{ "--sample-color": site.color }}
            >
              <div className="sample-nav">
                <strong>{site.name}</strong>
                <span>
                  Selected work{" "}
                  <span className="sample-nav-about">
                    &nbsp;&nbsp;&nbsp; About
                  </span>{" "}
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="sample-hero">
                <div className="sample-copy">
                  <span className="sample-eyebrow">INDEPENDENT BY DESIGN</span>
                  <h2>{site.title}</h2>
                  <p>{site.description}</p>
                  <span className="sample-link">
                    Explore the possibilities <ArrowUpRight size={15} />
                  </span>
                </div>
                <div
                  className="architect-art"
                  aria-label="Architectural illustration with warm natural shapes"
                  role="img"
                >
                  <div className="art-light" />
                  <div className="art-arch" />
                  <div className="art-floor" />
                  <div className="art-plinth" />
                  <div className="art-sphere" />
                  <div className="art-caption">A study in possibility — 01</div>
                </div>
              </div>
              <div className="sample-bottom">
                <span>Less, but considered.</span>
                <span>
                  Made with intention. <Plus size={12} />
                </span>
              </div>
            </div>
          ) : (
            <div className="demo-code">
              <span className="code-file">src / App.jsx</span>
              <pre>
                <code>{`export default function Website() {\n  return (\n    <main className="your-next-idea">\n      <nav>${site.name}</nav>\n\n      <section className="hero">\n        <h1>${concept === "studio" ? "Spaces for a slower life." : concept === "portfolio" ? "A fresh way to see things." : "Good things. Better together."}</h1>\n        <p>Something meaningful starts here.</p>\n        <a href="#work">Explore the possibilities ↗</a>\n      </section>\n    </main>\n  );\n}`}</code>
              </pre>
              <p>Real projects include the complete, editable source.</p>
            </div>
          )}
        </div>
      </div>
      <div className="demo-bottom-bar">
        <span>
          <MousePointer2 size={14} /> A few possibilities. Try one.
        </span>
        <div>
          {Object.entries(concepts).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setConcept(key)}
              aria-pressed={concept === key}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
