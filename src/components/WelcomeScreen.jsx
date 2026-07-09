import { WELCOME_KEY } from '../data/gameData';

export function isWelcomeSeen() {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearWelcomeSeen() {
  try {
    localStorage.removeItem(WELCOME_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Full-screen intro shown at the start of a voyage (before hull select).
 */
export default function WelcomeScreen({ onContinue, onOpenWiki }) {
  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-card">
        <div className="welcome-hero">
          <p className="welcome-kicker">Sector 7 · Solo Operations</p>
          <h1 id="welcome-title">Star Trader Solo</h1>
          <p className="welcome-lead">
            You command one trading company. Jump between six starports, buy low,
            sell high, and build the highest net worth you can before turn 100.
          </p>
        </div>

        <div className="welcome-grid">
          <section className="welcome-block">
            <h2>🎯 Your goal</h2>
            <p>
              <strong>Net worth</strong> = credits + cargo (and warehouses/stocks)
              − debt. Finish turn 100 with the best score and epilogue you can.
            </p>
          </section>
          <section className="welcome-block">
            <h2>🔄 The loop</h2>
            <ol>
              <li>Check prices and sparklines at your port.</li>
              <li>Buy goods if you have credits and cargo space.</li>
              <li>Jump to another planet (−fuel, +1 turn).</li>
              <li>Sell where prices are higher. Refuel and repeat.</li>
            </ol>
          </section>
          <section className="welcome-block">
            <h2>🌌 Going deeper</h2>
            <ul>
              <li>Contracts, stocks, loans, and futures for leverage</li>
              <li>Crew specialists and ship upgrades</li>
              <li>Seasons, demand spikes, and rival freighters</li>
              <li>Daily seeded runs and prestige unlocks</li>
            </ul>
          </section>
          <section className="welcome-block">
            <h2>🚀 Before you launch</h2>
            <p>
              Next you’ll pick a <strong>difficulty</strong> and a <strong>hull</strong>.
              Need help mid-flight? Open the <strong>Wiki</strong> anytime from the
              header.
            </p>
          </section>
        </div>

        <div className="welcome-actions">
          <button type="button" className="btn btn-secondary" onClick={onOpenWiki}>
            📖 Read the wiki
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg welcome-cta"
            onClick={() => {
              markWelcomeSeen();
              onContinue();
            }}
          >
            🚀 Continue to launch bay
          </button>
        </div>
      </div>
    </div>
  );
}
