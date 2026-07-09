import { useState } from 'react';
import { fmt, listSaveSlots } from '../utils/gameLogic';

export default function SaveSlotsPanel({ onSaveSlot, onLoadSlot, onDeleteSlot }) {
  const [slots, setSlots] = useState(() => listSaveSlots());
  const [label, setLabel] = useState('');

  function refresh() {
    setSlots(listSaveSlots());
  }

  return (
    <section className="panel slots-panel">
      <div className="panel-header">
        <h2>💾 Save Slots</h2>
        <span className="badge muted-badge">A–F</span>
      </div>
      <p className="muted intel-blurb">
        Named slots keep separate campaigns without overwriting each other.
      </p>
      <div className="futures-form" style={{ marginBottom: '0.5rem' }}>
        <input
          type="text"
          className="slot-label-input"
          placeholder="Optional label"
          maxLength={24}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <ul className="slot-list">
        {slots.map((s) => (
          <li key={s.id}>
            <div className="slot-info">
              <strong>
                {s.id}: {s.empty ? 'Empty' : s.label}
              </strong>
              {!s.empty && s.meta ? (
                <span className="muted">
                  {s.meta.companyName} · T{s.meta.turn} · {fmt(s.meta.credits)}{' '}
                  cr · {s.meta.planet}
                  {s.meta.runMode === 'daily' ? ' · Daily' : ''}
                </span>
              ) : (
                <span className="muted">No save</span>
              )}
            </div>
            <div className="quest-actions">
              <button
                type="button"
                className="btn btn-fuel btn-xs"
                onClick={() => {
                  const r = onSaveSlot(s.id, label || `Slot ${s.id}`);
                  refresh();
                  return r;
                }}
              >
                💾 Save
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                disabled={s.empty}
                onClick={() => {
                  onLoadSlot(s.id);
                  refresh();
                }}
              >
                📂 Load
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                disabled={s.empty}
                onClick={() => {
                  onDeleteSlot(s.id);
                  refresh();
                }}
              >
                🗑️ Clear
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
