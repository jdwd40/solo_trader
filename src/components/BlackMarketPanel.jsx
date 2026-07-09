import { useState } from 'react';
import { CONTRABAND } from '../data/gameData';
import {
  cargoUsed,
  contrabandInspectionChance,
  fmt,
  isBlackMarketPlanet,
  maxBuyQty,
} from '../utils/gameLogic';

export default function BlackMarketPanel({ state, onBuy, onSell }) {
  const [qty, setQty] = useState(1);
  const open = isBlackMarketPlanet(state.currentPlanet);
  const price = state.prices[state.currentPlanet][CONTRABAND];
  const owned = state.cargo[CONTRABAND] || 0;
  const free = state.cargoCapacity - cargoUsed(state.cargo);
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const maxBuy = maxBuyQty(state.credits, free, price);
  const riskPct = Math.round(contrabandInspectionChance(state) * 100);

  if (!open) {
    return (
      <section className="panel black-market-panel">
        <div className="panel-header">
          <h2>🕶️ Black Market</h2>
          <span className="badge muted-badge">Closed</span>
        </div>
        <p className="muted intel-blurb">
          No fence on {state.currentPlanet}. Try{' '}
          <strong>Outer Rim Depot</strong> or <strong>Vega Station</strong>.
          {owned > 0 && (
            <>
              {' '}
              You are carrying <strong>{owned}</strong> Contraband — patrol risk
              ~{riskPct}% next jump.
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="panel black-market-panel">
      <div className="panel-header">
        <h2>🕶️ Black Market</h2>
        <span className="badge">Open</span>
      </div>

      <p className="muted intel-blurb">
        Contraband trades hurt reputation. Customs may seize cargo in transit.
      </p>

      <div className="bm-stats">
        <span>
          💰 Price: <strong>{fmt(price)}</strong>
        </span>
        <span>
          📦 Owned: <strong>{owned}</strong>
        </span>
        <span>
          ⚠️ Jump risk:{' '}
          <strong className={riskPct > 25 ? 'debt' : ''}>{riskPct}%</strong>
        </span>
      </div>

      <div className="bm-actions">
        <input
          className="row-qty"
          type="number"
          min={1}
          max={99}
          value={qty}
          disabled={state.gameOver}
          onChange={(e) => setQty(e.target.value)}
          aria-label="Contraband quantity"
        />
        <button
          type="button"
          className="btn btn-buy"
          disabled={
            state.gameOver ||
            safeQty > maxBuy ||
            maxBuy <= 0
          }
          onClick={() => onBuy(safeQty)}
        >
          ➕ Buy
        </button>
        <button
          type="button"
          className="btn btn-buy btn-xs"
          disabled={state.gameOver || maxBuy <= 0}
          onClick={() => onBuy(maxBuy)}
        >
          ⏫ Max
        </button>
        <button
          type="button"
          className="btn btn-sell"
          disabled={state.gameOver || owned < safeQty}
          onClick={() => onSell(safeQty)}
        >
          ➖ Sell
        </button>
        <button
          type="button"
          className="btn btn-sell btn-xs"
          disabled={state.gameOver || owned <= 0}
          onClick={() => onSell(owned)}
        >
          ⏬ All
        </button>
      </div>
    </section>
  );
}
