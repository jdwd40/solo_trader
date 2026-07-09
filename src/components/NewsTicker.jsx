export default function NewsTicker({ news }) {
  const items = news || [];
  if (!items.length) return null;

  return (
    <div className="news-ticker" role="status" aria-live="polite">
      <span className="news-label">📰 News</span>
      <div className="news-track">
        {items.slice(0, 6).map((n, i) => (
          <span key={`${i}-${n.slice(0, 12)}`} className="news-item">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
