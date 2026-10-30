import { useState } from "react";
import { SandpackPreview, SandpackConsole } from "@codesandbox/sandpack-react";
import { Monitor, Tablet, Smartphone, Terminal } from "lucide-react";

const devices = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
];

export default function PreviewWorkspace({ error }) {
  const [device, setDevice] = useState(devices[0]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  return (
    <div className="preview-workspace">
      <div className="preview-controls">
        <div role="group" aria-label="Preview viewport">
          {devices.map(({ icon: Icon, ...item }) => (
            <button
              type="button"
              key={item.id}
              aria-label={`${item.label} preview`}
              aria-pressed={device.id === item.id}
              onClick={() => setDevice(item)}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-expanded={consoleOpen}
          aria-controls="preview-console"
          onClick={() => setConsoleOpen(!consoleOpen)}
        >
          <Terminal size={15} />
          Console
        </button>
      </div>
      {error ? (
        <p className="error preview-error" role="alert">
          {error}
        </p>
      ) : (
        <div className="preview-stage">
          <div
            className="preview-viewport"
            data-device={device.id}
            style={{ width: device.width }}
          >
            <SandpackPreview
              style={{ height: "60vh" }}
              showOpenInCodeSandbox={false}
            />
          </div>
        </div>
      )}
      {consoleOpen && (
        <div id="preview-console">
          <SandpackConsole
            style={{ height: 180 }}
            showHeader
            showSyntaxError
            showResetConsoleButton
            maxMessageCount={100}
          />
        </div>
      )}
      <p className="preview-note">
        Quick React preview. Screen sizes fit the available space. Build the
        exported Vite project to verify styles, configuration, and production
        behavior.
      </p>
    </div>
  );
}
