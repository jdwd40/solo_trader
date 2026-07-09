import { useState } from 'react';
import {
  DIFFICULTIES,
  HULL_SWITCH_COST,
  SHIP_HULLS,
} from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function HullSelect({
  mode = 'start',
  currentHullId,
  credits,
  difficulty = 'normal',
  onSelect,
  onCancel,
  onDifficulty,
}) {
  const isSwitch = mode === 'switch';
  const [diff, setDiff] = useState(difficulty || 'normal');

  return (
    <div
      className="game-over-overlay hull-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hull-title"
    >
      <div className="game-over-card game-over-wide hull-card">
        <p className="game-over-kicker">
          {isSwitch ? 'Shipyard' : 'Launch Bay'}
        </p>
        <h2 id="hull-title">
          {isSwitch ? 'Switch hull class' : 'Choose difficulty & hull'}
        </h2>
        <p className="game-over-company">
          {isSwitch
            ? `Re-registration costs ${fmt(HULL_SWITCH_COST)} cr. Cargo must fit the new hold.`
            : 'Difficulty locks at launch. Hull stats shape cargo, fuel, and risk.'}
        </p>

        {!isSwitch ? (
          <div className="diff-row">
            {Object.values(DIFFICULTIES).map((d) => (
              <button
                key={d.id}
                type="button"
                className={`diff-btn ${diff === d.id ? 'active' : ''}`}
                onClick={() => {
                  setDiff(d.id);
                  onDifficulty?.(d.id);
                }}
              >
                <strong>{d.name}</strong>
                <span className="muted">{d.blurb}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="hull-grid">
          {Object.values(SHIP_HULLS).map((h) => {
            const isCurrent = currentHullId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                className={`hull-option ${isCurrent ? 'is-current' : ''}`}
                disabled={isSwitch && isCurrent}
                onClick={() => {
                  if (!isSwitch) onDifficulty?.(diff);
                  onSelect(h.id);
                }}
              >
                <strong>{h.name}</strong>
                <span className="muted">{h.blurb}</span>
                <ul className="hull-stats">
                  <li>
                    Cargo {h.cargoBonus >= 0 ? '+' : ''}
                    {h.cargoBonus}
                  </li>
                  <li>Fuel +{h.fuelBonus}</li>
                  <li>Jump {h.travelFuelCost} fuel</li>
                  <li>Customs ×{h.contrabandRiskMod}</li>
                  <li>Pirates ×{h.pirateRiskMod}</li>
                </ul>
                {isCurrent && <span className="badge">Current</span>}
              </button>
            );
          })}
        </div>

        {isSwitch && onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}

        {!isSwitch && credits != null ? (
          <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            Starting credits after prestige & difficulty apply on select.
          </p>
        ) : null}
      </div>
    </div>
  );
}
