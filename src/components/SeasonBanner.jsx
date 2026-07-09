export default function SeasonBanner({ season }) {
  if (!season) return null;

  return (
    <div className="season-banner" role="status">
      <div className="season-main">
        <span className="season-kicker">Sector season</span>
        <strong className="season-name">{season.name}</strong>
        <span className="season-blurb muted">{season.blurb}</span>
      </div>
      <div className="season-meta">
        <span>
          {season.turnsLeftInSeason} jump
          {season.turnsLeftInSeason === 1 ? '' : 's'} left
        </span>
        <ul className="season-mods">
          {Object.entries(season.mods || {}).map(([c, f]) => (
            <li key={c} className={f >= 1 ? 'up' : 'down'}>
              {c} ×{f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
