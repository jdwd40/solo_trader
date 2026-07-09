import { fmt } from '../utils/gameLogic';

export default function HighScoreBoard({ scores }) {
  return (
    <section className="panel highscore-panel">
      <div className="panel-header">
        <h2>🏆 High Scores</h2>
        <span className="badge muted-badge">Local</span>
      </div>

      {scores.length === 0 ? (
        <p className="muted empty-cargo">No finished voyages yet. Reach turn 100!</p>
      ) : (
        <ol className="highscore-list">
          {scores.map((s, i) => (
            <li key={`${s.date}-${i}`}>
              <span className="hs-rank">#{i + 1}</span>
              <div className="hs-body">
                <strong className="hs-name">{s.companyName}</strong>
                <span className="hs-rating">{s.rating}</span>
              </div>
              <span className="hs-worth">{fmt(s.netWorth)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
