import { useEffect, useState, useId } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function AIConnectionSelect({ value, onChange, disabled }) {
  const id = useId();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api("/ai-settings")
      .then((data) => {
        if (!active) return;
        setSettings(data);
        const saved = data.connections.find(
          (c) => c.id === data.activeConnectionId,
        );
        onChange(
          saved
            ? saved.id
            : data.activeConnectionId
              ? undefined
              : data.serverDefault.enabled
                ? null
                : undefined,
        );
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [onChange, attempt]);
  return (
    <div className="connection-select">
      <div className="connection-select-heading">
        <label htmlFor={id}>AI connection</label>
        <Link to="/settings/ai">Manage APIs ↗</Link>
      </div>
      <select
        id={id}
        value={value === undefined ? "__choose" : value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || !settings}
      >
        <option value="__choose" disabled>
          {settings ? "Choose a connection" : "Loading connections…"}
        </option>
        {settings && (
          <option value="" disabled={!settings.serverDefault.enabled}>
            Server default · {settings.serverDefault.provider}
          </option>
        )}
        {settings?.connections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label} · {c.model}
          </option>
        ))}
      </select>
      {value && (
        <p className="field-hint">
          Uses your key. Your provider’s usage charges apply.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setAttempt((v) => v + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
