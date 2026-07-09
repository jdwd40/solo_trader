import { useState } from 'react';
import {
  COMMODITIES,
  WAREHOUSE_CAPACITY,
  WAREHOUSE_UNLOCK_COST,
  WAREHOUSE_UPKEEP,
} from '../data/gameData';
import { cargoUsed, fmt } from '../utils/gameLogic';

export default function WarehousePanel({
  state,
  onUnlock,
  onDeposit,
  onWithdraw,
}) {
  const planet = state.currentPlanet;
  const wh = state.warehouses?.[planet];
  const unlocked = Boolean(wh);
  const [commodity, setCommodity] = useState(COMMODITIES[0]);
  const [qty, setQty] = useState(5);
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const used = unlocked ? cargoUsed(wh) : 0;
  const shipOwned = state.cargo[commodity] || 0;
  const stored = unlocked ? wh[commodity] || 0 : 0;

  return (
    <section className="panel warehouse-panel">
      <div className="panel-header">
        <h2>🏭 Warehouse</h2>
        <span className="badge muted-badge">{planet}</span>
      </div>

      {!unlocked ? (
        <>
          <p className="muted intel-blurb">
            Rent planetary storage (cap {WAREHOUSE_CAPACITY}). Upkeep{' '}
            {WAREHOUSE_UPKEEP} cr/jump while occupied.
          </p>
          <button
            type="button"
            className="btn btn-fuel"
            disabled={
              state.gameOver || state.credits < WAREHOUSE_UNLOCK_COST
            }
            onClick={onUnlock}
          >
            🔑 Unlock ({fmt(WAREHOUSE_UNLOCK_COST)} cr)
          </button>
        </>
      ) : (
        <>
          <div className="cargo-bar" aria-hidden="true">
            <div
              className="cargo-bar-fill"
              style={{
                width: `${Math.min(100, Math.round((used / WAREHOUSE_CAPACITY) * 100))}%`,
              }}
            />
          </div>
          <p className="muted" style={{ margin: '0 0 0.55rem', fontSize: '0.85rem' }}>
            {used} / {WAREHOUSE_CAPACITY} stored
            {used > 0 ? ` · upkeep ${WAREHOUSE_UPKEEP} cr/jump` : ''}
          </p>

          <div className="futures-form">
            <select
              value={commodity}
              disabled={state.gameOver}
              onChange={(e) => setCommodity(e.target.value)}
            >
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c} (ship {state.cargo[c] || 0} · wh {wh[c] || 0})
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
            />
            <button
              type="button"
              className="btn btn-buy btn-xs"
              disabled={state.gameOver || shipOwned < safeQty}
              onClick={() => onDeposit(commodity, safeQty)}
            >
              ⬇️ Deposit
            </button>
            <button
              type="button"
              className="btn btn-sell btn-xs"
              disabled={state.gameOver || stored < safeQty}
              onClick={() => onWithdraw(commodity, safeQty)}
            >
              ⬆️ Withdraw
            </button>
          </div>
        </>
      )}
    </section>
  );
}
