import { CREW_ROLES } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function CrewPanel({ state, onHire, onFire }) {
  const crew = state.crew || {};

  return (
    <section className="panel crew-panel">
      <div className="panel-header">
        <h2>Crew</h2>
        <span className="badge muted-badge">Wages / jump</span>
      </div>
      <p className="muted intel-blurb">
        Hire specialists for permanent voyage bonuses. Wages auto-deduct each jump.
      </p>
      <ul className="crew-list">
        {Object.values(CREW_ROLES).map((role) => {
          const hired = Boolean(crew[role.id]);
          return (
            <li key={role.id} className={hired ? 'hired' : ''}>
              <div>
                <strong>
                  {role.name}
                  {hired ? ' · aboard' : ''}
                </strong>
                <span className="muted">{role.blurb}</span>
                <span className="upgrade-meta">
                  Hire {fmt(role.hireCost)} · wage {role.wage}
                </span>
              </div>
              {hired ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  disabled={state.gameOver}
                  onClick={() => onFire(role.id)}
                >
                  Fire
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-upgrade btn-xs"
                  disabled={
                    state.gameOver ||
                    state.needsHullSelect ||
                    state.credits < role.hireCost
                  }
                  onClick={() => onHire(role.id)}
                >
                  Hire
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
