export default function PageIntro({ eyebrow, title, description, children }) {
  return (
    <header className="page-intro">
      <p className="landing-kicker">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-lead">{description}</p>}
      {children}
    </header>
  );
}
