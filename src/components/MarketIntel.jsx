import { useState } from 'react';
import { INTEL_COST, LEGAL_COMMODITIES } from '../data/gameData';
import { comparePlanetPrices, fmt } from '../utils/gameLogic';

export default function MarketIntel({ state, onBuyIntel }) {
  const [focus, setFocus] = useState(LEGAL_COMMODITIES[0]);
  const active = state.intelActive;

  const rows = active
    ? comparePlanetPrices(state.prices, state.currentPlanet, focus)
    : [];

  const localPrice = state.prices[state.currentPlanet][focus];

  return (
    <section className="panel intel-panel">
      <div className="panel-header">
        <h2>📡 Market Intel</h2>
        <span className={`badge ${active ? '' : 'muted-badge'}`}>
          {active ? 'Active' : `${fmt(INTEL_COST)} cr`}
        </span>
      </div>

      <p className="intel-blurb muted">
        Pay for a sector scan of relative prices. Expires when you jump.
      </p>

      {!active ? (
        <button
          type="button"
          className="btn btn-fuel"
          disabled={state.gameOver || state.credits < INTEL_COST}
          onClick={onBuyIntel}
        >
          📡 Buy Intel ({fmt(INTEL_COST)} cr)
        </button>
      ) : (
        <>
          <div className="intel-focus">
            <label htmlFor="intel-commodity">📦 Commodity</label>
            <select
              id="intel-commodity"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            >
              {LEGAL_COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="intel-local">
              Here: <strong>{fmt(localPrice)}</strong>
            </span>
          </div>

          <ul className="intel-list">
            {rows.map((row) => (
              <li key={row.planet} className={`intel-row label-${row.label}`}>
                <span className="intel-planet">{row.planet}</span>
                <span className="intel-price">{fmt(row.price)}</span>
                <span className={`intel-tag ${row.label}`}>
                  {row.label === 'cheaper' && '▼ cheaper'}
                  {row.label === 'dearer' && '▲ dearer'}
                  {row.label === 'similar' && '≈ similar'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
