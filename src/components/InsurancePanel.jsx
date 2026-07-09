import { INSURANCE_PLANS } from '../data/gameData';
import { fmt, scaledInsurancePremium } from '../utils/gameLogic';

export default function InsurancePanel({ state, onBuy }) {
  const active = state.insurance || [];

  return (
    <section className="panel insurance-panel">
      <div className="panel-header">
        <h2>Insurance</h2>
        <span className="badge muted-badge">{active.length} active</span>
      </div>

      <p className="muted intel-blurb">
        Premiums scale with sector pirate heat. Claims auto-pay on covered mishaps.
      </p>

      {active.length > 0 && (
        <ul className="policy-list">
          {active.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              <span className="muted">{p.turnsLeft} jumps left</span>
            </li>
          ))}
        </ul>
      )}

      <ul className="plan-list">
        {Object.values(INSURANCE_PLANS).map((plan) => {
          const owned = active.find((p) => p.id === plan.id);
          const premium = scaledInsurancePremium(plan.premium, state);
          const canBuy = !state.gameOver && state.credits >= premium;
          return (
            <li key={plan.id} className="plan-card">
              <div>
                <strong>{plan.name}</strong>
                <span className="upgrade-desc">{plan.description}</span>
                <span className="upgrade-meta">
                  {plan.duration} jumps · {fmt(premium)} cr
                  {premium !== plan.premium ? ' (heat)' : ''}
                  {owned ? ` · renews (${owned.turnsLeft} left)` : ''}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-upgrade"
                disabled={!canBuy}
                onClick={() => onBuy(plan.id)}
              >
                {owned ? 'Renew' : 'Buy'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
