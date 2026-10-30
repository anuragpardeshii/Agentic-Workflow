import { Link } from "react-router-dom";
import { ArrowRight, Check, Code2, Globe2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import PageIntro from "../components/PageIntro";
const capabilities = [
  {
    icon: Sparkles,
    number: "01",
    title: "Your words. A starting point.",
    description:
      "Describe the website you have in mind. Give your idea a shape, a structure, and a first impression you can build on.",
    points: [
      "Plain-language briefs",
      "Responsive React layouts",
      "A preview to explore",
    ],
    color: "lavender",
    label: "IMAGINE → CREATE",
    art: "“A home for my next big idea.”",
    note: "It all starts with a little imagination.",
  },
  {
    icon: Code2,
    number: "02",
    title: "Room to make it your own.",
    description:
      "Refine the direction with a prompt, or open the source and get into the details. Your next version starts with your point of view.",
    points: [
      "Prompt-based refinements",
      "Editable source files",
      "Live browser preview",
    ],
    color: "blue",
    label: "CREATE → REFINE",
    art: "A little more you. With every edit.",
    note: "Change the words. Shape the experience.",
  },
  {
    icon: Globe2,
    number: "03",
    title: "A next chapter without limits.",
    description:
      "Download your complete project and take it to your preferred host. Your source code stays yours, wherever you choose to publish.",
    points: [
      "Complete ZIP export",
      "Production build scripts",
      "Your choice of hosting",
    ],
    color: "green",
    label: "REFINE → LAUNCH",
    art: "From your workspace to the world.",
    note: "Export. Build. Publish on your terms.",
  },
];
export default function Features() {
  return (
    <Layout>
      <div className="product-page">
        <div className="landing-container">
          <PageIntro
            eyebrow="THE BUILDFAST PLATFORM"
            title={
              <>
                A little less friction.
                <br />
                <span>A lot more creating.</span>
              </>
            }
            description="One thoughtful workspace for the journey from your first idea to a website you can call your own."
          >
            <Link to="/ai" className="landing-button">
              Start creating <ArrowRight size={17} />
            </Link>
          </PageIntro>
          <div className="capability-list">
            {capabilities.map(({ icon: Icon, ...item }) => (
              <section className="capability-row" key={item.number}>
                <div className="capability-copy">
                  <span className="section-number">
                    {item.number} / THE POSSIBILITIES
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>
                        <Check size={15} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`capability-art tone-${item.color}`}>
                  <span>
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <p>{item.art}</p>
                  <small>{item.note}</small>
                </div>
              </section>
            ))}
          </div>
          <section className="quiet-callout">
            <div>
              <h2>Start where you are.</h2>
              <p>Bring an idea. Make the next step yours.</p>
            </div>
            <Link className="landing-button" to="/ai">
              Open your workspace <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
