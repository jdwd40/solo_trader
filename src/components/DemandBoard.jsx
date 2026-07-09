import { PLANETS } from '../data/gameData';

export default function DemandBoard({ demandEvents }) {
  const events = demandEvents || [];

  return (
    <section className="panel demand-panel">
      <div className="panel-header">
        <h2>📊 Sector Demand</h2>
        <span className="badge muted-badge">{events.length} active</span>
      </div>

      {events.length === 0 ? (
        <p className="muted empty-cargo">
          No shortages or surpluses right now. Keep jumping — news travels fast.
        </p>
      ) : (
        <ul className="demand-list">
          {events.map((ev) => (
            <li key={ev.id} className={`demand-item ${ev.type}`}>
              <span className="demand-type">
                {ev.type === 'shortage' ? '📈 Shortage' : '📉 Surplus'}
              </span>
              <strong>
                {ev.commodity} · {ev.planet}
              </strong>
              <span className="muted">
                ×{ev.factor} · {ev.turnsLeft} jump
                {ev.turnsLeft === 1 ? '' : 's'} left
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="demand-specialties muted">
        Hubs: Food@Earthport · Ore@Mars · Tech@Nova · Luxury@Vega · Fuel@Rim
      </p>
      <p className="sr-only">Planets: {PLANETS.join(', ')}</p>
    </section>
  );
}
