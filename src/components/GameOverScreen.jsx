import { useEffect, useRef, useState } from 'react';
import {
  getEpilogue,
  getHull,
  getRating,
  reputationLabel,
} from '../data/gameData';
import PrestigePanel from './PrestigePanel';
import ReplayCodePanel from './ReplayCodePanel';
import RunAnalytics from './RunAnalytics';
import {
  awardPrestigePoints,
  buildRunAnalytics,
  calcNetWorthFromState,
  cargoValue,
  fmt,
  loadDailyScores,
  loadHighScores,
  portfolioValue,
  saveDailyScore,
  saveHighScore,
  warehouseValue,
} from '../utils/gameLogic';
import { encodeReplayCode } from '../utils/replayCode';

export default function GameOverScreen({ state, onNewGame, onScoreRecorded }) {
  const prices = state.prices[state.currentPlanet];
  const cargoVal = cargoValue(state.cargo, prices);
  const whVal = warehouseValue(state.warehouses, state.prices);
  const stockVal = portfolioValue(state.portfolio, state.stockPrices);
  const debt = state.debt || 0;
  const netWorth = calcNetWorthFromState(state);
  const rating = getRating(netWorth);
  const epilogue = getEpilogue(state, netWorth);
  const analytics = buildRunAnalytics(state);
  const replayCode = encodeReplayCode({
    seed: state.rngSeed,
    companyName: state.companyName,
    netWorth,
    turn: state.turn,
    epilogueId: epilogue.id,
    rating,
    difficulty: state.difficulty,
  });
  const [scores, setScores] = useState(() => loadHighScores());
  const [dailyScores, setDailyScores] = useState([]);
  const [gained, setGained] = useState(0);
  const [copyMsg, setCopyMsg] = useState('');
  const recordedRef = useRef(false);

  useEffect(() => {
    if (state.scoreRecorded || recordedRef.current) {
      setScores(loadHighScores());
      if (state.runMode === 'daily' && state.rngSeed) {
        setDailyScores(loadDailyScores(state.rngSeed));
      }
      return;
    }
    recordedRef.current = true;
    const next = saveHighScore({
      companyName: state.companyName,
      netWorth,
      rating,
      turn: state.turn,
      date: new Date().toISOString(),
    });
    setScores(next);
    if (state.runMode === 'daily' && state.rngSeed) {
      const d = saveDailyScore(state.rngSeed, {
        companyName: state.companyName,
        netWorth,
        rating,
        epilogue: epilogue.title,
        date: new Date().toISOString(),
      });
      setDailyScores(d);
    }
    const { gained: pts } = awardPrestigePoints(netWorth);
    setGained(pts);
    onScoreRecorded?.();
  }, [
    state.scoreRecorded,
    state.companyName,
    state.turn,
    state.runMode,
    state.rngSeed,
    netWorth,
    rating,
    epilogue.title,
    onScoreRecorded,
  ]);

  const hull = getHull(state.hullId);

  return (
    <div
      className="game-over-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      <div className="game-over-card game-over-wide">
        <p className="game-over-kicker">Voyage Complete</p>
        <h2 id="game-over-title">Final Score</h2>
        <p className="game-over-company">
          {state.companyName}
          {state.shipTitle ? ` · ${state.shipTitle}` : ''}
          {hull ? ` · ${hull.name}` : ''}
          {state.runMode === 'daily' ? ` · Daily ${state.rngSeed}` : ''}
        </p>

        <div className="epilogue-block">
          <span className="rating-label">Epilogue</span>
          <span className="rating-value">{epilogue.title}</span>
          <p className="epilogue-text">{epilogue.text}</p>
        </div>

        <dl className="score-grid">
          <div>
            <dt>Credits</dt>
            <dd>{fmt(state.credits)}</dd>
          </div>
          <div>
            <dt>Ship cargo</dt>
            <dd>{fmt(cargoVal)}</dd>
          </div>
          <div>
            <dt>Warehouses</dt>
            <dd>{fmt(whVal)}</dd>
          </div>
          <div>
            <dt>Stocks</dt>
            <dd>{fmt(stockVal)}</dd>
          </div>
          <div>
            <dt>Debt</dt>
            <dd className={debt > 0 ? 'debt' : ''}>{fmt(debt)}</dd>
          </div>
          <div>
            <dt>Reputation</dt>
            <dd>
              {reputationLabel(state.reputation ?? 55)} (
              {state.reputation ?? 55})
            </dd>
          </div>
          <div className="score-highlight">
            <dt>Net Worth</dt>
            <dd>{fmt(netWorth)}</dd>
          </div>
        </dl>

        <div className="rating-block">
          <span className="rating-label">Rating</span>
          <span className="rating-value">{rating}</span>
        </div>

        <RunAnalytics analytics={analytics} />

        <ReplayCodePanel
          code={replayCode}
          onCopy={() => setCopyMsg('Code copied.')}
        />
        {copyMsg ? (
          <p className="control-message" style={{ marginTop: 0 }}>
            {copyMsg}
          </p>
        ) : null}

        <PrestigePanel gained={gained} />

        {state.runMode === 'daily' && dailyScores.length > 0 ? (
          <div className="go-highscores">
            <h3>Daily leaderboard ({state.rngSeed})</h3>
            <ol className="highscore-list compact">
              {dailyScores.slice(0, 5).map((s, i) => (
                <li key={`d-${s.date}-${i}`}>
                  <span className="hs-rank">#{i + 1}</span>
                  <div className="hs-body">
                    <strong className="hs-name">{s.companyName}</strong>
                    <span className="hs-rating">{s.epilogue || s.rating}</span>
                  </div>
                  <span className="hs-worth">{fmt(s.netWorth)}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="go-highscores">
          <h3>All-time leaderboard</h3>
          {scores.length === 0 ? (
            <p className="muted">No scores saved.</p>
          ) : (
            <ol className="highscore-list compact">
              {scores.slice(0, 5).map((s, i) => (
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
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onNewGame}
        >
          Start New Game
        </button>
      </div>
    </div>
  );
}
