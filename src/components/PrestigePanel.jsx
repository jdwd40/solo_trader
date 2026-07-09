import { useState } from 'react';
import { PRESTIGE_UPGRADES } from '../data/gameData';
import {
  buyPrestigeUpgrade,
  loadPrestige,
  prestigeUpgradeCost,
} from '../utils/gameLogic';

export default function PrestigePanel({ gained = 0, onChanged }) {
  const [meta, setMeta] = useState(() => loadPrestige());
  const [msg, setMsg] = useState('');

  function buy(id) {
    const result = buyPrestigeUpgrade(id);
    setMsg(result.message);
    if (result.ok) {
      setMeta(result.meta);
      onChanged?.(result.meta);
    }
  }

  return (
    <div className="prestige-panel">
      <h3>✨ Prestige / New Game+</h3>
      {gained > 0 ? (
        <p className="prestige-gain">
          +{gained} prestige point{gained === 1 ? '' : 's'} from this run
        </p>
      ) : null}
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        Points: <strong>{meta.points}</strong> · Lifetime earned:{' '}
        {meta.totalEarned || 0}. Bonuses apply on the next hull select.
      </p>

      <ul className="prestige-list">
        {Object.values(PRESTIGE_UPGRADES).map((u) => {
          const level = meta.levels?.[u.id] || 0;
          const cost = prestigeUpgradeCost(u.id, level);
          const maxed = level >= u.maxLevel;
          return (
            <li key={u.id}>
              <div>
                <strong>
                  {u.name} · Lv {level}/{u.maxLevel}
                </strong>
                <span className="muted">{u.desc}</span>
              </div>
              <button
                type="button"
                className="btn btn-upgrade btn-xs"
                disabled={maxed || cost == null || meta.points < cost}
                onClick={() => buy(u.id)}
              >
                {maxed ? '✅ Max' : `✨ ${cost} pt`}
              </button>
            </li>
          );
        })}
      </ul>
      {msg ? <p className="control-message">{msg}</p> : null}
    </div>
  );
}
