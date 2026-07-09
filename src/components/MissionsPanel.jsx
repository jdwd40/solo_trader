import { fmt, getMissionProgress } from '../utils/gameLogic';

export default function MissionsPanel({ state, onClaim }) {
  if (state.missionsEnabled === false) return null;
  const missions = getMissionProgress(state);
  const open = missions.filter((m) => !m.claimed);

  return (
    <section className="panel missions-panel">
      <div className="panel-header">
        <h2>Missions</h2>
        <span className="badge muted-badge">
          {missions.filter((m) => m.claimed).length}/{missions.length}
        </span>
      </div>
      <p className="muted intel-blurb">
        Optional first-run track. Claim cash when objectives complete.
      </p>
      {open.length === 0 ? (
        <p className="muted empty-cargo">All mission rewards claimed. Fly free.</p>
      ) : (
        <ul className="mission-list">
          {open.map((m) => (
            <li key={m.id} className={m.done ? 'done' : ''}>
              <div>
                <strong>
                  {m.done ? '✅ ' : '○ '}
                  {m.title}
                </strong>
                <span className="muted">{m.desc}</span>
                <span className="upgrade-meta">+{fmt(m.reward)} cr</span>
              </div>
              <button
                type="button"
                className="btn btn-buy btn-xs"
                disabled={!m.claimable || state.gameOver || state.needsHullSelect}
                onClick={() => onClaim(m.id)}
              >
                Claim
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
