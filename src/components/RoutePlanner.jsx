import { useState } from 'react';
import { PLANETS } from '../data/gameData';
import { estimateRoute, fmt, travelFuelForState } from '../utils/gameLogic';

export default function RoutePlanner({ state, onSaveRoute, onNextHop }) {
  const [draft, setDraft] = useState(() => state.route || []);
  const fuelCost = travelFuelForState(state);

  const estimate = estimateRoute(
    state.currentPlanet,
    draft,
    state.fuel,
    state.maxFuel,
    fuelCost
  );

  const savedEstimate = estimateRoute(
    state.currentPlanet,
    (state.route || []).slice(state.routeCursor || 0),
    state.fuel,
    state.maxFuel,
    fuelCost
  );

  function addPlanet(planet) {
    setDraft((d) => [...d, planet]);
  }

  function removeLast() {
    setDraft((d) => d.slice(0, -1));
  }

  function clearDraft() {
    setDraft([]);
  }

  return (
    <section className="panel route-panel">
      <div className="panel-header">
        <h2>Trade Route</h2>
        <span className="badge muted-badge">{fuelCost} fuel / hop</span>
      </div>

      <p className="muted intel-blurb">
        Build a multi-stop plan, review fuel/turns, then fly hop-by-hop.
      </p>

      <div className="route-draft">
        <span className="route-path">
          {state.currentPlanet}
          {draft.length ? ` → ${draft.join(' → ')}` : ' → …'}
        </span>
        <p className="futures-hint muted">{estimate.summary}</p>
        {!estimate.fuelOk && estimate.jumps > 0 && (
          <p className="debt" style={{ margin: '0 0 0.5rem', fontSize: '0.82rem' }}>
            Need ~{fmt(estimate.fuelNeeded)} fuel (have {state.fuel}). Plan refuels.
          </p>
        )}
      </div>

      <div className="route-add-grid">
        {PLANETS.map((p) => (
          <button
            key={p}
            type="button"
            className="btn btn-secondary btn-xs"
            disabled={state.gameOver}
            onClick={() => addPlanet(p)}
          >
            + {p}
          </button>
        ))}
      </div>

      <div className="loan-actions" style={{ marginTop: '0.55rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!draft.length}
          onClick={removeLast}
        >
          Undo stop
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!draft.length}
          onClick={clearDraft}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn btn-fuel"
          disabled={state.gameOver || draft.length < 1}
          onClick={() => onSaveRoute(draft)}
        >
          Save route
        </button>
      </div>

      {(state.route || []).length > 0 && (
        <div className="route-saved">
          <strong>Active route</strong>
          <span className="muted">
            {(state.route || []).map((p, i) => (
              <span key={`${p}-${i}`}>
                {i > 0 ? ' → ' : ''}
                <span className={i === (state.routeCursor || 0) ? 'route-next' : ''}>
                  {p}
                </span>
              </span>
            ))}
          </span>
          <p className="futures-hint muted">
            Remaining: {savedEstimate.summary}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={state.gameOver || state.fuel < fuelCost}
            onClick={onNextHop}
          >
            Next hop
          </button>
        </div>
      )}
    </section>
  );
}
