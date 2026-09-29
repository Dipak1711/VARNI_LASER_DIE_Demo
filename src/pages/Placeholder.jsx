export default function Placeholder({ title }) {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> MODULE</div>
          <h1>{title}</h1>
          <p className="muted lead">This section is coming soon.</p>
        </div>
      </div>
      <div className="card empty">Nothing to show yet for {title}.</div>
    </>
  );
}
