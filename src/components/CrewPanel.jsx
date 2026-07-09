import { CREW_ROLES } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function CrewPanel({ state, onHire, onFire }) {
  const crew = state.crew || {};

  return (
    <section className="panel crew-panel">
      <div className="panel-header">
        <h2>👥 Crew</h2>
        <span className="badge muted-badge">Wages / jump</span>
      </div>
      <p className="muted intel-blurb">
        Hire specialists for permanent voyage bonuses. Wages auto-deduct each jump.
      </p>
      <ul className="crew-list crew-list-cards">
        {Object.values(CREW_ROLES).map((role) => {
          const hired = Boolean(crew[role.id]);
          return (
            <li key={role.id} className={`crew-card ${hired ? 'hired' : ''}`}>
              <div className="crew-avatar-wrap">
                <img
                  className="crew-avatar"
                  src={role.avatar}
                  alt={`${role.name} portrait`}
                  loading="lazy"
                />
                {hired ? <span className="crew-badge">✅ Aboard</span> : null}
              </div>
              <div className="crew-card-body">
                <strong>{role.name}</strong>
                <span className="muted">{role.blurb}</span>
                <span className="upgrade-meta">
                  Hire {fmt(role.hireCost)} · wage {role.wage}
                </span>
                {hired ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    disabled={state.gameOver}
                    onClick={() => onFire(role.id)}
                  >
                    🚪 Fire
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
                    🤝 Hire
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
