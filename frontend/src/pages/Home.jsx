import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Globe2,
  Layers,
  Sparkles,
} from "lucide-react";
import Layout from "../components/Layout";
import WebsiteDemo from "../components/landing/WebsiteDemo";
import HoverGrid from "../components/landing/HoverGrid";
import "../landing.css";

const workflows = [
  {
    name: "Imagine",
    icon: Sparkles,
    label: "A little imagination goes a long way",
    title: "Start with a thought.\nSee what it becomes.",
    text: "The portfolio you keep putting off. The business you’re ready to launch. Describe what you have in mind and give your idea a place to begin.",
    tags: [
      "Natural language",
      "Fresh starting points",
      "Your creative direction",
    ],
    action: "Bring your idea to life",
    color: "lavender",
    art: "Every great website\nstarts with “what if?”",
    detail: "Your words. A world of possibilities.",
  },
  {
    name: "Create",
    icon: Layers,
    label: "From a blank page to a first impression",
    title: "A website that starts\nto feel like you.",
    text: "Turn your brief into a responsive website with structure, styling, and source code. Explore a first version, then follow your curiosity.",
    tags: ["Responsive layouts", "React + Tailwind", "Live preview"],
    action: "Create something new",
    color: "blue",
    art: "A first draft.\nA fresh perspective.",
    detail: "Make the leap from imagined to visible.",
  },
  {
    name: "Refine",
    icon: Code2,
    label: "The details make the difference",
    title: "Make a change.\nMake it your own.",
    text: "Ask for a calmer palette, a bolder headline, or a whole new section. Switch to the source when you want to shape the details yourself.",
    tags: ["Prompt-based changes", "Source editor", "Instant feedback"],
    action: "Find your point of view",
    color: "green",
    art: "A little more you.\nWith every edit.",
    detail: "The best version is the one you make your own.",
  },
  {
    name: "Launch",
    icon: Globe2,
    label: "Built for the next chapter",
    title: "Your website.\nReady for the world.",
    text: "Export your complete project and take it to your preferred host. Build for production, connect your domain, and give your idea a home on the web.",
    tags: ["Complete source export", "Production build", "Your choice of host"],
    action: "Prepare your next launch",
    color: "peach",
    art: "From your workspace\nto the world.",
    detail: "Export. Build. Publish on your terms.",
  },
];
const ideas = [
  {
    name: "An independent point of view.",
    category: "PORTFOLIO",
    caption: "Let your work do the talking.",
    className: "idea-portfolio",
    word: "Selected\nworks.",
    prompt:
      "Build an elegant editorial portfolio for an independent designer with a project gallery and contact section.",
  },
  {
    name: "A home for your next big thing.",
    category: "PRODUCT LAUNCH",
    caption: "Make a first impression that lasts.",
    className: "idea-product",
    word: "Meet your\nnext chapter.",
    prompt:
      "Create a minimal product launch website for a productivity app with features, pricing, and a signup section.",
  },
  {
    name: "Small business. Big possibility.",
    category: "SMALL BUSINESS",
    caption: "Turn a local favourite into a destination.",
    className: "idea-business",
    word: "Good days\nstart here.",
    prompt:
      "Design a warm cafe website with a menu, opening hours, location, and an inviting brand story.",
  },
  {
    name: "Something worth gathering for.",
    category: "EVENT",
    caption: "Give your community a place to begin.",
    className: "idea-event",
    word: "Make\nsome room.",
    prompt:
      "Build a bold event website for a creative community gathering with a schedule, speakers, and registration section.",
  },
];
export default function Home() {
  const [step, setStep] = useState(0);
  const [railEdges, setRailEdges] = useState({ start: true, end: false });
  const rail = useRef(null);
  const workflow = workflows[step];
  const Icon = workflow.icon;
  useEffect(() => {
    const element = rail.current;
    const update = () =>
      setRailEdges({
        start: element.scrollLeft < 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);
  function scrollIdeas(direction) {
    const element = rail.current;
    element.scrollBy({
      left:
        direction * (element.children[0].getBoundingClientRect().width + 24),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  return (
    <Layout>
      <div className="landing-page">
        <HoverGrid>
          <div className="hero-intro">
            <p className="landing-kicker">
              <span /> A LITTLE AI. A LOT OF POSSIBILITY.
            </p>
            <h1>
              Big ideas.
              <br className="mobile-break" /> <span>Beautiful</span> websites.
            </h1>
            <p className="hero-description">
              Everything you need to take an idea further.
              <br className="mobile-break" /> Imagine, create, and shape your
              next website with AI.
            </p>
            <div className="hero-actions">
              <Link className="landing-button" to="/ai">
                Start creating <ArrowRight size={18} />
              </Link>
              <a className="landing-text-link" href="#how-it-works">
                See how it works <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className="landing-container hero-demo-wrap">
            <WebsiteDemo />
          </div>
        </HoverGrid>
        <div className="landing-container possibility-strip">
          <span>YOUR IDEAS DESERVE TO BE OUT THERE.</span>
          <div>
            <span>
              <Check size={15} /> Create with AI
            </span>
            <span>
              <Check size={15} /> Own every line
            </span>
            <span>
              <Check size={15} /> Take it anywhere
            </span>
          </div>
        </div>
        <section
          className="landing-container workflow-section"
          id="how-it-works"
        >
          <div className="section-intro">
            <h2>Less between you and your next big thing.</h2>
            <p>
              One connected workflow. From the first “what if” to what’s next.
            </p>
          </div>
          <div
            className="workflow-tabs"
            role="tablist"
            aria-label="Website creation workflow"
          >
            {workflows.map((item, index) => (
              <button
                key={item.name}
                role="tab"
                id={`workflow-tab-${index}`}
                aria-selected={step === index}
                aria-controls="workflow-panel"
                tabIndex={step === index ? 0 : -1}
                onClick={() => setStep(index)}
                onKeyDown={(event) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  ) {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 3
                          : (step + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                    setStep(next);
                    document.getElementById(`workflow-tab-${next}`)?.focus();
                  }
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div
            className="workflow-panel"
            id="workflow-panel"
            role="tabpanel"
            aria-labelledby={`workflow-tab-${step}`}
          >
            <div className="workflow-copy">
              <p className="workflow-label">
                <Icon size={20} />
                {workflow.label}
              </p>
              <h3>{workflow.title}</h3>
              <p className="workflow-description">{workflow.text}</p>
              <div className="workflow-tags">
                {workflow.tags.map((tag) => (
                  <span key={tag}>
                    <Check size={13} />
                    {tag}
                  </span>
                ))}
              </div>
              <Link className="landing-text-link" to="/ai">
                {workflow.action} <ArrowRight size={17} />
              </Link>
            </div>
            <div
              className={`workflow-art art-${workflow.color}`}
              key={workflow.name}
            >
              <div className="art-grid" />
              <div className="workflow-art-paper">
                <span className="paper-brand">
                  <Layers size={17} /> buildfast
                </span>
                <p>{workflow.art}</p>
                <span className="paper-caption">{workflow.detail}</span>
              </div>
              <span className="art-sticker">
                <Icon size={16} />
                {workflow.name.toUpperCase()}
              </span>
              <svg
                className="art-scribble"
                viewBox="0 0 380 100"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 88C79 13 136 -1 140 46C145 104 202 72 259 38C294 17 329 10 367 9M343 2L372 8L355 30"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
        <section className="ideas-section" id="possibilities">
          <div className="landing-container">
            <div className="ideas-heading">
              <div>
                <p className="landing-kicker">
                  A STARTING POINT FOR EVERY WHAT IF.
                </p>
                <h2>What will you put into the world?</h2>
                <p>
                  A side project. A fresh start. Something entirely your own.
                </p>
              </div>
              <div className="rail-controls">
                <button
                  aria-label="Previous inspiration"
                  onClick={() => scrollIdeas(-1)}
                  disabled={railEdges.start}
                >
                  <ArrowLeft />
                </button>
                <button
                  aria-label="Next inspiration"
                  onClick={() => scrollIdeas(1)}
                  disabled={railEdges.end}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
            <div className="ideas-rail" ref={rail}>
              {ideas.map((idea) => (
                <Link
                  to={`/ai?prompt=${encodeURIComponent(idea.prompt)}`}
                  className={`idea-card ${idea.className}`}
                  key={idea.category}
                >
                  <div className="idea-art">
                    <span className="idea-art-brand">
                      {idea.category === "PORTFOLIO"
                        ? "AM®"
                        : idea.category === "SMALL BUSINESS"
                          ? "everyday / café"
                          : idea.category === "EVENT"
                            ? "the gathering • 01"
                            : "gather."}
                    </span>
                    <strong>{idea.word}</strong>
                    <div className="idea-shape" />
                    <span className="idea-art-footer">
                      {idea.caption}
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <div className="idea-card-copy">
                    <span className="idea-category">{idea.category}</span>
                    <h3>{idea.name}</h3>
                    <span className="idea-card-link">
                      Start with this idea <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="landing-container ownership-section">
          <div>
            <p className="landing-kicker">MADE TO BE YOURS.</p>
            <h2>
              Keep the creativity.
              <br />
              Keep the code.
            </h2>
            <p>
              Buildfast helps you get moving, then gives you the freedom to go
              further. Every project comes with source you can edit, export, and
              deploy with the host you choose.
            </p>
            <Link className="landing-text-link" to="/features">
              Explore the platform <ArrowRight size={17} />
            </Link>
          </div>
          <div className="ownership-list">
            {[
              [
                "01",
                "Your vision, brought to life.",
                "Start with a plain-language brief and shape the result as your idea evolves.",
              ],
              [
                "02",
                "Nothing hidden behind the preview.",
                "Explore the React source, make your own changes, and download the complete project.",
              ],
              [
                "03",
                "A launch on your terms.",
                "Export your source, create a production build, and publish with your preferred hosting provider.",
              ],
            ].map(([number, title, text]) => (
              <div key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="landing-finale">
          <div className="finale-orbit" aria-hidden="true" />
          <p className="landing-kicker">YOUR NEXT CHAPTER IS A CLICK AWAY.</p>
          <h2>
            You’ve got the idea.
            <br />
            Let’s give it a website.
          </h2>
          <Link className="landing-button" to="/ai">
            Create something great <ArrowRight size={18} />
          </Link>
          <p>Start with a thought. Make it something real.</p>
        </section>
      </div>
    </Layout>
  );
}
