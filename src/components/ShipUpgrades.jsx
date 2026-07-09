import { UPGRADES, upgradeCost } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function ShipUpgrades({ state, onBuyUpgrade }) {
  return (
    <section className="panel upgrades-panel">
      <div className="panel-header">
        <h2>⚙️ Ship Upgrades</h2>
        <span className="badge muted-badge">Permanent</span>
      </div>

      <ul className="upgrade-list">
        {Object.keys(UPGRADES).map((key) => {
          const def = UPGRADES[key];
          const level = state.upgrades?.[key] || 0;
          const maxed = level >= def.maxLevel;
          const cost = upgradeCost(key, level);
          const canAfford = !maxed && cost != null && state.credits >= cost;
          const disabled = state.gameOver || maxed || !canAfford;

          let effectHint = '';
          if (key === 'cargo') {
            effectHint = `Hold: ${state.cargoCapacity} units`;
          } else if (key === 'fuel') {
            effectHint = `Tank: ${state.maxFuel} max`;
          }

          return (
            <li key={key} className="upgrade-card">
              <div className="upgrade-info">
                <strong>{def.name}</strong>
                <span className="upgrade-desc">{def.description}</span>
                <span className="upgrade-meta">
                  Lv {level}/{def.maxLevel} · {effectHint}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-upgrade"
                disabled={disabled}
                onClick={() => onBuyUpgrade(key)}
                title={
                  maxed
                    ? 'Max level'
                    : canAfford
                      ? `Upgrade for ${fmt(cost)}`
                      : `Need ${fmt(cost)} credits`
                }
              >
                {maxed ? '✅ Maxed' : `⬆️ ${fmt(cost)} cr`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
