import { useState } from "react";
import { ArrowRight, MessageCircle, Lightbulb, LifeBuoy } from "lucide-react";
import PageIntro from "../components/PageIntro";
import Layout from "../components/Layout";
import { api } from "../services/api";
export default function Contact() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api("/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      setSuccess(result.message);
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <div className="product-page">
        <div className="landing-container">
          <PageIntro
            eyebrow="LET’S TALK"
            title={
              <>
                Good things start
                <br />
                <span>with a conversation.</span>
              </>
            }
            description="A question, a fresh idea, or a detail we could make better. We’d love to hear from you."
          />
          <section className="contact-grid">
            <aside className="contact-notes">
              <span className="section-number">A LITTLE HUMAN CONNECTION</span>
              <h2>What’s on your mind?</h2>
              {[
                [
                  LifeBuoy,
                  "A helping hand",
                  "Tell us where you got stuck and what you were trying to create.",
                ],
                [
                  Lightbulb,
                  "A spark of an idea",
                  "Share a feature you’d love to see in your workspace.",
                ],
                [
                  MessageCircle,
                  "Something else entirely",
                  "Feedback, a collaboration, or just a hello. There’s room for it here.",
                ],
              ].map(([Icon, title, text]) => (
                <div key={title} className="contact-note">
                  <Icon size={19} />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </aside>
            <form
              className="product-form contact-form"
              onSubmit={submit}
              aria-busy={busy}
            >
              <h2>Send a little note.</h2>
              <p className="form-description">
                Leave your email so we can get back to you.
              </p>
              <label className="field">
                Your name
                <input
                  name="name"
                  placeholder="Alex Morgan"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  disabled={busy}
                />
              </label>
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={busy}
                />
              </label>
              <label className="field">
                Your message
                <textarea
                  name="message"
                  placeholder="I’d love to talk about…"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  disabled={busy}
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              {success && (
                <p className="success-note" role="status">
                  {success}
                </p>
              )}
              <button className="landing-button" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
                <ArrowRight size={16} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
