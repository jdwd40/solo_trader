import { useState } from 'react';
import { LEGAL_COMMODITIES, PLANETS } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

function newRule() {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    enabled: true,
    action: 'buy',
    commodity: 'Food',
    planet: '',
    maxPrice: 50,
    minPrice: 80,
  };
}

export default function AutoTradePanel({
  state,
  onSaveRules,
  onToggleArrive,
  onRunNow,
}) {
  const [rules, setRules] = useState(() => state.autoTradeRules || []);

  function update(id, patch) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function add() {
    setRules((prev) => [...prev, newRule()].slice(0, 8));
  }

  function remove(id) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function save() {
    onSaveRules(rules);
  }

  return (
    <section className="panel autotrade-panel">
      <div className="panel-header">
        <h2>Auto-trade</h2>
        <span className="badge muted-badge">Macros</span>
      </div>
      <p className="muted intel-blurb">
        Simple if/then rules (not full AI). Run on arrival or manually.
      </p>

      <label className="a11y-list" style={{ marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <input
            type="checkbox"
            checked={state.autoTradeOnArrive !== false}
            onChange={(e) => onToggleArrive(e.target.checked)}
          />
          Run on planet arrival
        </span>
      </label>

      <ul className="autotrade-list">
        {rules.map((r) => (
          <li key={r.id}>
            <label className="at-enable">
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) => update(r.id, { enabled: e.target.checked })}
              />
            </label>
            <select
              value={r.action}
              onChange={(e) => update(r.id, { action: e.target.value })}
            >
              <option value="buy">Buy if ≤</option>
              <option value="sell">Sell if ≥</option>
            </select>
            <select
              value={r.commodity}
              onChange={(e) => update(r.id, { commodity: e.target.value })}
            >
              {LEGAL_COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={r.planet || ''}
              onChange={(e) => update(r.id, { planet: e.target.value })}
              title="Blank = any planet"
            >
              <option value="">Any planet</option>
              {PLANETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {r.action === 'buy' ? (
              <input
                className="row-qty"
                type="number"
                min={1}
                value={r.maxPrice}
                onChange={(e) =>
                  update(r.id, {
                    maxPrice: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                  })
                }
                title="Max unit price"
              />
            ) : (
              <input
                className="row-qty"
                type="number"
                min={1}
                value={r.minPrice}
                onChange={(e) =>
                  update(r.id, {
                    minPrice: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                  })
                }
                title="Min unit price"
              />
            )}
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => remove(r.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="loan-actions">
        <button type="button" className="btn btn-secondary" onClick={add}>
          + Rule
        </button>
        <button type="button" className="btn btn-fuel" onClick={save}>
          Save rules
        </button>
        <button
          type="button"
          className="btn btn-buy"
          disabled={state.gameOver || state.needsHullSelect}
          onClick={onRunNow}
        >
          Run now
        </button>
      </div>
      <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.45rem' }}>
        Buy uses max affordable/cargo. Sell dumps full stack. Example: Food ≤{' '}
        {fmt(50)} at Earthport.
      </p>
    </section>
  );
}
