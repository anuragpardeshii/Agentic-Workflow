import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Plus,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import Layout from "../components/Layout";
import PageIntro from "../components/PageIntro";
import { api } from "../services/api";

export default function AISettings() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [provider, setProvider] = useState("openai"),
    [editing, setEditing] = useState(null);
  const [label, setLabel] = useState(""),
    [model, setModel] = useState(""),
    [key, setKey] = useState("");
  const [visible, setVisible] = useState(false),
    [accepted, setAccepted] = useState(false),
    [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null),
    [checks, setChecks] = useState({});
  const formRef = useRef(null);
  const selected = data?.providers.find((p) => p.id === provider);
  async function load() {
    const next = await api("/ai-settings");
    setData(next);
    return next;
  }
  useEffect(() => {
    let active = true;
    api("/ai-settings")
      .then((next) => {
        if (active) {
          setData(next);
          const saved = next.connections.find((c) => c.provider === "openai");
          setEditing(saved?.id || null);
          setLabel(saved?.label || "");
          setModel(
            saved?.model ||
              next.providers.find((p) => p.id === "openai")?.defaultModel ||
              "",
          );
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);
  function choose(id, scroll = true) {
    const saved = data.connections.find((c) => c.provider === id);
    setProvider(id);
    setEditing(saved?.id || null);
    setLabel(saved?.label || "");
    setModel(
      saved?.model || data.providers.find((p) => p.id === id).defaultModel,
    );
    setKey("");
    setVisible(false);
    setAccepted(false);
    setError("");
    setNotice("");
    setDeleting(null);
    if (scroll)
      formRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
  }
  async function action(run, message) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await run();
      await load();
      if (message) setNotice(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    await action(async () => {
      const result = await api(
        `/ai-settings/connections${editing ? `/${editing}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            provider,
            label,
            model,
            billingAccepted: accepted,
            ...(!editing || key ? { apiKey: key } : {}),
          }),
        },
      );
      setEditing(result.connection.id);
      setChecks((c) => ({ ...c, [result.connection.id]: "" }));
    }, "Connection saved. Set it as your default or choose it when creating a website.");
    setKey("");
    setVisible(false);
  }
  return (
    <Layout>
      <div className="product-page api-settings landing-container">
        <Link to="/ai" className="subtle-link">
          <ArrowLeft size={14} /> Workspace
        </Link>
        <PageIntro
          eyebrow="YOUR TOOLS. YOUR POSSIBILITIES."
          title={
            <>
              A little more <span>choice.</span>
            </>
          }
          description="Bring your own AI. Connect the models you love and choose how your next website comes to life."
        />
        {error && (
          <div className="error" role="alert">
            {error}{" "}
            {!data && <button onClick={() => action(load)}>Try again</button>}
          </div>
        )}
        {notice && (
          <p className="success-note" role="status">
            {notice}
          </p>
        )}
        {!data ? (
          <p role="status" className="settings-loading">
            Opening your connections…
          </p>
        ) : (
          <>
            <section aria-labelledby="supported-apis">
              <div className="section-heading-row">
                <div>
                  <p className="landing-kicker">MADE TO WORK TOGETHER</p>
                  <h2 id="supported-apis">Supported APIs</h2>
                </div>
                <span className="quiet-count">
                  {data.providers.filter((p) => p.kind === "hosted").length}{" "}
                  hosted providers + local AI
                </span>
              </div>
              <div className="provider-grid">
                {data.providers.map((p, index) => {
                  const connected = data.connections.some(
                    (c) => c.provider === p.id,
                  );
                  return (
                    <article
                      className={`provider-card provider-tone-${index % 3} ${provider === p.id ? "is-selected" : ""}`}
                      key={p.id}
                    >
                      <div className="provider-card-top">
                        <span className="provider-symbol" aria-hidden="true">
                          {p.name === "OpenRouter" ? "↗" : p.name.charAt(0)}
                        </span>
                        <span className="provider-badge">
                          {p.kind === "local"
                            ? "No key needed"
                            : connected
                              ? "Connected"
                              : "Your API key"}
                        </span>
                      </div>
                      <h3>{p.name}</h3>
                      <p>{p.description}</p>
                      {p.kind === "hosted" ? (
                        <button
                          className="landing-text-link"
                          disabled={busy}
                          onClick={() => choose(p.id)}
                          aria-pressed={provider === p.id}
                        >
                          {connected ? "Manage connection" : "Connect provider"}
                          <ArrowUpRight size={15} />
                        </button>
                      ) : (
                        <a
                          className="landing-text-link"
                          href={p.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          About local AI <ArrowUpRight size={15} />
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <div className="connection-settings-grid">
              <section
                className="connection-form-panel"
                ref={formRef}
                aria-labelledby="connection-heading"
              >
                <span className="soft-icon">
                  <KeyRound size={23} />
                </span>
                <h2 id="connection-heading">
                  {editing
                    ? "Make it your own."
                    : "Connect your next build partner."}
                </h2>
                <p className="form-description">
                  {selected?.name} ·{" "}
                  {editing
                    ? "Leave the key blank to keep your saved key."
                    : "One connection per provider. You can change its model or key at any time."}
                </p>
                {!data.storageReady && (
                  <p role="alert" className="error">
                    API key storage needs administrator setup before you can
                    save a key.
                  </p>
                )}
                <form className="product-form" onSubmit={save} aria-busy={busy}>
                  <label className="field">
                    Provider
                    <select
                      aria-label="Provider"
                      value={provider}
                      disabled={busy}
                      onChange={(e) => choose(e.target.value, false)}
                    >
                      {data.providers
                        .filter((p) => p.kind === "hosted")
                        .map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="field">
                    Connection name
                    <input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={`My ${selected?.name.split(" · ")[0]} connection`}
                      required
                      maxLength={60}
                      disabled={busy}
                    />
                  </label>
                  <label className="field">
                    Model ID
                    <input
                      aria-label="Model ID"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      list="provider-models"
                      required
                      maxLength={120}
                      spellCheck={false}
                      disabled={busy}
                    />
                    <datalist id="provider-models">
                      {selected?.models.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    <span className="field-hint">
                      Choose a suggestion or enter a text-generation model
                      available to your account.{" "}
                      <a
                        href={selected?.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Provider documentation ↗
                      </a>
                    </span>
                  </label>
                  <label className="field" htmlFor="personal-api-key">
                    {editing ? "Replace API key (optional)" : "API key"}
                  </label>
                  <div className="api-key-input">
                    <input
                      id="personal-api-key"
                      type={visible ? "text" : "password"}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder={
                        editing
                          ? "Keep the saved key"
                          : "Paste your provider API key"
                      }
                      autoComplete="off"
                      spellCheck={false}
                      required={!editing}
                      minLength={12}
                      maxLength={512}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      aria-label={visible ? "Hide API key" : "Show API key"}
                      aria-pressed={visible}
                      onClick={() => setVisible((v) => !v)}
                    >
                      {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <a
                    className="key-link"
                    href={selected?.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get a key from {selected?.name} <ArrowUpRight size={13} />
                  </a>
                  <label className="billing-consent">
                    <input
                      type="checkbox"
                      required
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      disabled={busy}
                    />
                    <span>
                      I understand that generation uses my API account and may
                      incur provider charges. A chat subscription may not
                      include API usage.
                    </span>
                  </label>
                  <button
                    className="landing-button"
                    disabled={busy || !data.storageReady}
                  >
                    {busy
                      ? "Working…"
                      : editing
                        ? "Save changes"
                        : "Save connection"}
                    <Plus size={16} />
                  </button>
                </form>
                <p className="key-privacy">
                  <ShieldCheck size={16} /> Your key is encrypted on the server.
                  Only its last four characters are shown after saving.
                </p>
              </section>
              <section
                className="saved-connections"
                aria-labelledby="saved-connections-heading"
              >
                <p className="landing-kicker">READY WHEN YOU ARE</p>
                <h2 id="saved-connections-heading">Your connections</h2>
                <p className="form-description">
                  Choose a default for new builds and refinements. You can
                  switch connections in the editor.
                </p>
                <article className="saved-connection">
                  <div>
                    <h3>Server default</h3>
                    <p>
                      {data.serverDefault.provider} · {data.serverDefault.model}
                    </p>
                  </div>
                  <button
                    className="connection-default"
                    disabled={
                      busy ||
                      !data.activeConnectionId ||
                      !data.serverDefault.enabled
                    }
                    onClick={() =>
                      action(
                        () =>
                          api("/ai-settings/default", {
                            method: "PUT",
                            body: JSON.stringify({ connectionId: null }),
                          }),
                        "Server default selected.",
                      )
                    }
                  >
                    {!data.activeConnectionId ? (
                      <>
                        <Check size={13} /> Default
                      </>
                    ) : (
                      "Use default"
                    )}
                  </button>
                </article>
                {data.connections.map((c) => (
                  <article className="saved-connection" key={c.id}>
                    <div className="saved-connection-title">
                      <div>
                        <h3>{c.label}</h3>
                        <p>
                          {
                            data.providers.find((p) => p.id === c.provider)
                              ?.name
                          }
                        </p>
                      </div>
                      {data.activeConnectionId === c.id && (
                        <span className="provider-badge">
                          <Check size={12} /> Default
                        </span>
                      )}
                    </div>
                    <p className="connection-model">{c.model}</p>
                    <p className="connection-key-hint">API key {c.keyHint}</p>
                    <div className="connection-actions">
                      <button
                        disabled={busy || data.activeConnectionId === c.id}
                        onClick={() =>
                          action(
                            () =>
                              api("/ai-settings/default", {
                                method: "PUT",
                                body: JSON.stringify({ connectionId: c.id }),
                              }),
                            `${c.label} is now your default.`,
                          )
                        }
                      >
                        Use by default
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            setChecks((values) => ({ ...values, [c.id]: "" }));
                            const result = await api(
                              `/ai-settings/connections/${c.id}/check`,
                              { method: "POST" },
                            );
                            setChecks((values) => ({
                              ...values,
                              [c.id]: result.message,
                            }));
                          })
                        }
                      >
                        Check key
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => choose(c.provider)}
                        aria-label={`Edit ${c.label}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => setDeleting(c.id)}
                        aria-label={`Remove ${c.label}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {checks[c.id] && (
                      <p className="success-note" role="status">
                        {checks[c.id]}
                      </p>
                    )}
                    {deleting === c.id && (
                      <div className="connection-remove">
                        <p>
                          Remove this saved connection? This does not revoke the
                          key at {c.provider}. If it is your default, new builds
                          will use the server default.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              await api(`/ai-settings/connections/${c.id}`, {
                                method: "DELETE",
                              });
                              if (editing === c.id) {
                                setEditing(null);
                                setKey("");
                                setLabel("");
                                setAccepted(false);
                              }
                              setDeleting(null);
                            }, "Connection removed.")
                          }
                        >
                          Remove connection
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => setDeleting(null)}
                        >
                          Keep it
                        </button>
                      </div>
                    )}
                  </article>
                ))}
                {!data.connections.length && (
                  <p className="connections-empty">
                    Your own tools, all in one place.
                    <br />
                    Connect your first API to get started.
                  </p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
