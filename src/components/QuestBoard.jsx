import { fmt } from '../utils/gameLogic';

export default function QuestBoard({
  state,
  onAccept,
  onComplete,
  onAbandon,
}) {
  const board = state.questBoard || [];
  const active = state.quests || [];

  return (
    <section className="panel quest-panel">
      <div className="panel-header">
        <h2>📋 Contracts</h2>
        <span className="badge muted-badge">
          {active.length} active · {board.length} offered
        </span>
      </div>

      <p className="muted intel-blurb">
        Accept delivery jobs. Bring the goods to the destination before time runs out.
      </p>

      {active.length > 0 && (
        <>
          <h3 className="subhead">📌 Active</h3>
          <ul className="quest-list">
            {active.map((q) => {
              const here = state.currentPlanet === q.toPlanet;
              const owned = state.cargo[q.commodity] || 0;
              const canComplete =
                !state.gameOver && here && owned >= q.qty;
              return (
                <li key={q.id} className="quest-card active">
                  <div>
                    <strong>{q.title}</strong>
                    <span className="muted">
                      → {q.toPlanet} · {q.turnsLeft} jumps · reward{' '}
                      {fmt(q.reward)} · have {owned}/{q.qty}
                    </span>
                  </div>
                  <div className="quest-actions">
                    <button
                      type="button"
                      className="btn btn-buy btn-xs"
                      disabled={!canComplete}
                      onClick={() => onComplete(q.id)}
                    >
                      ✅ Deliver
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      disabled={state.gameOver}
                      onClick={() => onAbandon(q.id)}
                    >
                      ❌ Drop
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h3 className="subhead">📋 Board</h3>
      {board.length === 0 ? (
        <p className="muted empty-cargo">No offers. Jump to refresh the board.</p>
      ) : (
        <ul className="quest-list">
          {board.map((q) => (
            <li key={q.id} className="quest-card">
              <div>
                <strong>{q.title}</strong>
                <span className="muted">
                  → {q.toPlanet} · {q.turnsLeft} jumps · +{fmt(q.reward)} cr · +
                  {q.repReward} rep
                </span>
              </div>
              <button
                type="button"
                className="btn btn-fuel btn-xs"
                disabled={state.gameOver || (state.quests || []).length >= 2}
                onClick={() => onAccept(q.id)}
              >
                ✍️ Accept
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
