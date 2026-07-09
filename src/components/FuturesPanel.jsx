import { useState } from 'react';
import {
  FUTURES_DURATION,
  FUTURES_FEE_RATE,
  LEGAL_COMMODITIES,
  MAX_FUTURES,
} from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function FuturesPanel({ state, onOpen, onSettle }) {
  const [commodity, setCommodity] = useState(LEGAL_COMMODITIES[0]);
  const [qty, setQty] = useState(5);
  const price = state.prices[state.currentPlanet][commodity];
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const fee = Math.max(1, Math.round(price * safeQty * FUTURES_FEE_RATE));
  const openCount = (state.futures || []).length;
  const canOpen =
    !state.gameOver &&
    openCount < MAX_FUTURES &&
    state.credits >= fee;

  return (
    <section className="panel futures-panel">
      <div className="panel-header">
        <h2>Futures</h2>
        <span className="badge muted-badge">
          {openCount}/{MAX_FUTURES} · {FUTURES_DURATION} jumps
        </span>
      </div>

      <p className="muted intel-blurb">
        Lock a sale price now (fee {Math.round(FUTURES_FEE_RATE * 100)}%).
        Deliver cargo later from any planet to settle.
      </p>

      <div className="futures-form">
        <select
          value={commodity}
          disabled={state.gameOver}
          onChange={(e) => setCommodity(e.target.value)}
        >
          {LEGAL_COMMODITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="row-qty"
          type="number"
          min={1}
          max={99}
          value={qty}
          disabled={state.gameOver}
          onChange={(e) => setQty(e.target.value)}
          aria-label="Futures quantity"
        />
        <button
          type="button"
          className="btn btn-upgrade"
          disabled={!canOpen}
          onClick={() => onOpen(commodity, safeQty)}
          title={`Lock ${safeQty} @ ${fmt(price)} · fee ${fmt(fee)}`}
        >
          Open ({fmt(fee)})
        </button>
      </div>
      <p className="futures-hint muted">
        Spot here: {fmt(price)} · Lock total {fmt(price * safeQty)}
      </p>

      {(state.futures || []).length === 0 ? (
        <p className="muted empty-cargo">No open contracts.</p>
      ) : (
        <ul className="futures-list">
          {state.futures.map((f) => {
            const owned = state.cargo[f.commodity] || 0;
            const canSettle = !state.gameOver && owned > 0;
            return (
              <li key={f.id}>
                <div className="futures-info">
                  <strong>
                    {f.qty}× {f.commodity} @ {fmt(f.lockedPrice)}
                  </strong>
                  <span className="muted">
                    {f.turnsLeft} jump{f.turnsLeft === 1 ? '' : 's'} left · opened{' '}
                    {f.openedAt}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sell btn-xs"
                  disabled={!canSettle}
                  onClick={() => onSettle(f.id)}
                  title={
                    canSettle
                      ? `Settle up to ${Math.min(owned, f.qty)}`
                      : 'Need cargo to settle'
                  }
                >
                  Settle
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
