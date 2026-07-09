import { PLANETS } from '../data/gameData';
import { pressureLabel } from '../utils/gameLogic';

export default function PirateMap({ state }) {
  const pressure = state.lanePressure || {};

  return (
    <section className="panel pirate-panel">
      <div className="panel-header">
        <h2>Pirate Pressure</h2>
        <span className="badge muted-badge">Dynamic</span>
      </div>
      <p className="muted intel-blurb">
        Hot lanes mean more pirate tolls and higher insurance premiums.
      </p>
      <ul className="pressure-list">
        {PLANETS.map((p) => {
          const n = Math.round(pressure[p] ?? 25);
          const here = p === state.currentPlanet;
          return (
            <li key={p} className={here ? 'is-here' : ''}>
              <span className="press-name">
                {p}
                {here ? ' · you' : ''}
              </span>
              <div className="press-bar" aria-hidden="true">
                <div
                  className="press-fill"
                  style={{ width: `${n}%` }}
                  data-level={pressureLabel(n)}
                />
              </div>
              <span className="press-val">
                {n} · {pressureLabel(n)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
