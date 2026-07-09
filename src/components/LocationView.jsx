import { LOCATION_IMAGES, PLANET_ICONS } from '../data/gameData';

/**
 * Viewport of the current dock — photoreal planet / station vista.
 * Updates whenever the player travels.
 */
export default function LocationView({ planet }) {
  const loc = LOCATION_IMAGES[planet] || {
    src: '/locations/earthport.jpg',
    blurb: 'Unknown berth.',
  };
  const icon = PLANET_ICONS[planet] || '🪐';

  return (
    <section className="panel location-view" aria-label={`Docked at ${planet}`}>
      <div className="panel-header">
        <h2>
          <span className="icon-label" aria-hidden="true">
            {icon}
          </span>{' '}
          Dock view
        </h2>
        <span className="badge">{planet}</span>
      </div>

      <div className="location-frame">
        <img
          key={planet}
          className="location-img"
          src={loc.src}
          alt={`View of ${planet}`}
          loading="lazy"
          decoding="async"
        />
        <div className="location-caption">
          <strong>{planet}</strong>
          <span>{loc.blurb}</span>
        </div>
      </div>
    </section>
  );
}
