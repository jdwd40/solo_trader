import { reputationLabel } from '../data/gameData';
import { calcNetWorthFromState, fmt } from '../utils/gameLogic';

export default function StatusBar({ state, onRename }) {
  const netWorth = calcNetWorthFromState(state);
  const rep = state.reputation ?? 55;

  return (
    <header className="status-bar status-bar-wide">
      <div className="status-company">
        <label htmlFor="company-name">Company</label>
        <input
          id="company-name"
          type="text"
          value={state.companyName}
          onChange={(e) => onRename(e.target.value)}
          disabled={state.gameOver}
          maxLength={40}
          aria-label="Company name"
        />
        {state.shipTitle ? (
          <span className="ship-title muted">{state.shipTitle}</span>
        ) : null}
      </div>
      <div className="status-stat">
        <span className="label">Credits</span>
        <span className="value credits">{fmt(state.credits)}</span>
      </div>
      <div className="status-stat">
        <span className="label">Debt</span>
        <span className={`value ${state.debt > 0 ? 'debt' : ''}`}>
          {fmt(state.debt || 0)}
        </span>
      </div>
      <div className="status-stat">
        <span className="label">Turn</span>
        <span className="value">
          {state.turn} / {state.maxTurns}
        </span>
      </div>
      <div className="status-stat">
        <span className="label">Planet</span>
        <span className="value planet">{state.currentPlanet}</span>
      </div>
      <div className="status-stat">
        <span className="label">Fuel</span>
        <span className="value">
          {state.fuel} / {state.maxFuel}
        </span>
      </div>
      <div className="status-stat">
        <span className="label">Rep</span>
        <span className="value rep" title={`Reputation ${rep}/100`}>
          {reputationLabel(rep)}
        </span>
      </div>
      <div className="status-stat">
        <span className="label">Net Worth</span>
        <span className="value net-worth" title="Credits + cargo + warehouses − debt">
          {fmt(netWorth)}
        </span>
      </div>
    </header>
  );
}
