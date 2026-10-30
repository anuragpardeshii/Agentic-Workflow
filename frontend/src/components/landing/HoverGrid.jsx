import { useRef, useState } from "react";
export default function HoverGrid({ children }) {
  const [tiles, setTiles] = useState([]);
  const previous = useRef("");
  const sequence = useRef(0);
  function move(event) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - bounds.left) / 48) * 48;
    const y = Math.floor((event.clientY - bounds.top) / 48) * 48;
    const cell = `${x}:${y}`;
    if (cell === previous.current || y > 480) return;
    previous.current = cell;
    const id = sequence.current++;
    setTiles((old) => [...old.slice(-7), { x, y, id }]);
  }
  return (
    <section
      className="landing-hero"
      onPointerMove={move}
      onPointerLeave={() => {
        previous.current = "";
      }}
    >
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <span
            key={tile.id}
            className={`hover-tile tile-${tile.id % 3}`}
            style={{ left: tile.x, top: tile.y }}
            onAnimationEnd={() =>
              setTiles((old) => old.filter((item) => item.id !== tile.id))
            }
          />
        ))}
      </div>
      {children}
    </section>
  );
}
