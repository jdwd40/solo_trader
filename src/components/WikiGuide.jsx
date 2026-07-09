import { useState } from 'react';

const SECTIONS = [
  {
    id: 'basics',
    title: 'Basics',
    body: [
      'You have 100 turns to maximise net worth.',
      'Net worth = credits + ship cargo value + warehouse stock + stocks − debt.',
      'Every jump costs fuel (hull-dependent, usually 8–10) and advances the turn by 1.',
      'Prices refresh every jump (−20% to +25%, floor 10 credits).',
    ],
  },
  {
    id: 'trading',
    title: 'Trading',
    body: [
      'Buy only with enough credits and free cargo space.',
      'Sell only goods you own. Use Max / All for speed.',
      'Sparklines show recent local price history.',
      'Market Intel (paid) compares other planets until your next jump.',
      'Auto-trade rules can buy-if-cheap / sell-if-dear on arrival.',
    ],
  },
  {
    id: 'travel',
    title: 'Travel & fuel',
    body: [
      'Travel panel lists all six ports. Current planet is disabled.',
      'Low fuel blocks jumps — buy Fuel Cells or use Fill Tank.',
      'Navigator crew reduces jump fuel cost (minimum 6).',
      'Fuel Tanker hull has huge tanks and cheaper jumps.',
    ],
  },
  {
    id: 'events',
    title: 'Seasons, demand & risk',
    body: [
      'Seasons last ~10 jumps and shift whole commodity classes.',
      'Demand events create shortages (prices up) or surpluses (down).',
      'Pirate pressure rises on hot lanes — more tolls and higher insurance.',
      'Travel events: pirates, spoilage, fuel leaks, rumours, bonus contracts.',
      'Contraband only at Outer Rim & Vega — customs risk scales with cargo and reputation.',
    ],
  },
  {
    id: 'systems',
    title: 'Systems & leverage',
    body: [
      'Loans: borrow cash; interest every jump. Repay to restore reputation.',
      'Futures: pay a fee to lock a sale price; settle by delivering cargo.',
      'Stocks: four sector indices; value counts toward net worth.',
      'Warehouses: unlock storage on a planet; small upkeep while used.',
      'Insurance: covers spoilage, fuel leaks, and/or customs; premiums scale with heat.',
    ],
  },
  {
    id: 'crew-ship',
    title: 'Crew & hulls',
    body: [
      'Bulk Freighter: extra cargo. Shadow Runner: smuggling edge. Fuel Tanker: range.',
      'Navigator: −1 fuel/jump. Broker: +8% legal sales. Gunner: halves pirate losses.',
      'Crew take wages every jump. Fire them anytime from the Crew panel.',
      'Ship upgrades permanently expand hold or tanks.',
    ],
  },
  {
    id: 'modes',
    title: 'Modes & meta',
    body: [
      'Classic: free RNG each run. Daily: shared seed for the UTC day.',
      'Difficulty (Easy / Normal / Hard) locks at launch.',
      'Save slots A–F plus quick-save. Export/import JSON between browsers.',
      'Finish a run for prestige points and New Game+ permanent bonuses.',
      'Replay codes (STS1…) let friends verify a score checksum offline.',
    ],
  },
  {
    id: 'tips',
    title: 'Quick tips',
    body: [
      'Early game: Food/Ore routes, keep fuel above 20, avoid big debt.',
      'Mid game: ride seasons and shortages; contracts pad cash and rep.',
      'Late game: warehouses + stocks park wealth; watch turn 100.',
      'Keyboard: 1–6 jump, F fill fuel, I intel, S save, L load, ? accessibility.',
    ],
  },
];

export default function WikiGuide({ open, onClose }) {
  const [section, setSection] = useState(SECTIONS[0].id);
  if (!open) return null;

  const current = SECTIONS.find((s) => s.id === section) || SECTIONS[0];

  return (
    <div
      className="wiki-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wiki-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="wiki-card">
        <header className="wiki-header">
          <div>
            <p className="wiki-kicker">Field manual</p>
            <h2 id="wiki-title">Captain’s Wiki</h2>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="wiki-body">
          <nav className="wiki-nav" aria-label="Wiki sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`wiki-nav-btn ${section === s.id ? 'active' : ''}`}
                onClick={() => setSection(s.id)}
              >
                {s.title}
              </button>
            ))}
          </nav>

          <article className="wiki-content">
            <h3>{current.title}</h3>
            <ul>
              {current.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
