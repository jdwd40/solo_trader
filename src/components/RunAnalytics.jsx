import { fmt } from '../utils/gameLogic';

export default function RunAnalytics({ analytics }) {
  if (!analytics) return null;
  const top = (analytics.byCommodity || []).slice(0, 5);
  const maxAbs = Math.max(1, ...top.map((r) => Math.abs(r.net)));

  return (
    <div className="run-analytics">
      <h3>📊 Post-run analytics</h3>
      <dl className="stats-grid">
        <div>
          <dt>💹 Net gain</dt>
          <dd className={analytics.totalGain >= 0 ? '' : 'debt'}>
            {fmt(analytics.totalGain)}
          </dd>
        </div>
        <div>
          <dt>🚀 Jumps</dt>
          <dd>{analytics.jumps}</dd>
        </div>
        <div>
          <dt>💵 Best sale</dt>
          <dd>{fmt(analytics.bestSale)}</dd>
        </div>
        <div>
          <dt>📈 Stock P&amp;L</dt>
          <dd className={analytics.stockPnL >= 0 ? '' : 'debt'}>
            {fmt(analytics.stockPnL)}
          </dd>
        </div>
        <div>
          <dt>🛰️ Rival scoops</dt>
          <dd>{analytics.rivalWins}</dd>
        </div>
        <div>
          <dt>🪐 Hot planet</dt>
          <dd>
            {analytics.bestPlanet
              ? `${analytics.bestPlanet.planet} (${analytics.bestPlanet.visits})`
              : '—'}
          </dd>
        </div>
      </dl>

      <p className="muted" style={{ fontSize: '0.82rem', margin: '0.4rem 0' }}>
        {analytics.crewRoi}
      </p>

      {top.length > 0 ? (
        <>
          <h4 className="subhead">📦 Commodity P&amp;L</h4>
          <ul className="analytics-bars">
            {top.map((row) => (
              <li key={row.commodity}>
                <span className="ab-name">{row.commodity}</span>
                <div className="ab-track">
                  <div
                    className={`ab-fill ${row.net >= 0 ? 'pos' : 'neg'}`}
                    style={{
                      width: `${Math.min(100, (Math.abs(row.net) / maxAbs) * 100)}%`,
                    }}
                  />
                </div>
                <span className={`ab-val ${row.net >= 0 ? '' : 'debt'}`}>
                  {fmt(row.net)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted">No commodity trades recorded.</p>
      )}
    </div>
  );
}
