import { COMMODITY_ICONS, getSeasonMeta } from '../data/gameData';

export default function SeasonBanner({ season }) {
  if (!season) return null;

  const meta = getSeasonMeta(season);
  const icon = season.icon || meta.icon || '🌀';
  const image = season.image || meta.image;

  return (
    <div className={`season-banner season-${season.id || meta.id}`} role="status">
      {image ? (
        <div className="season-thumb-wrap">
          <img
            className="season-thumb"
            src={image}
            alt=""
            loading="lazy"
            key={season.id || meta.id}
          />
        </div>
      ) : null}

      <div className="season-main">
        <span className="season-kicker">🌀 Sector season</span>
        <strong className="season-name">
          <span className="season-icon" aria-hidden="true">
            {icon}
          </span>{' '}
          {season.name}
        </strong>
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
              <span aria-hidden="true">{COMMODITY_ICONS[c] || '📦'}</span>{' '}
              {c} ×{f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
