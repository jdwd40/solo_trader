import { COMMODITIES, COMMODITY_ICONS, CONTRABAND } from '../data/gameData';
import { cargoUsed, cargoValue, fmt } from '../utils/gameLogic';

export default function CargoPanel({ state }) {
  const used = cargoUsed(state.cargo);
  const prices = state.prices[state.currentPlanet];
  const value = cargoValue(state.cargo, prices);
  const filled = COMMODITIES.filter((c) => (state.cargo[c] || 0) > 0);
  const pct = Math.min(100, Math.round((used / state.cargoCapacity) * 100));

  return (
    <section className="panel cargo-panel">
      <div className="panel-header">
        <h2>Cargo Hold</h2>
        <span className="badge">
          {used} / {state.cargoCapacity}
        </span>
      </div>

      <div className="cargo-bar" aria-hidden="true">
        <div className="cargo-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {filled.length === 0 ? (
        <p className="muted empty-cargo">Hold is empty. Buy goods at the market.</p>
      ) : (
        <ul className="cargo-list">
          {filled.map((c) => (
            <li key={c} className={c === CONTRABAND ? 'is-contraband' : ''}>
              <span className="cargo-name">
                <span className="icon-label" aria-hidden="true">
                  {COMMODITY_ICONS[c] || '📦'}
                </span>{' '}
                {c}
              </span>
              <span className="cargo-qty">×{state.cargo[c]}</span>
              <span className="cargo-val">
                {fmt(state.cargo[c] * (prices[c] || 0))} cr
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="cargo-footer">
        <span>Market value</span>
        <strong>{fmt(value)} cr</strong>
      </div>
    </section>
  );
}
