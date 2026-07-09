import { useState } from 'react';
import { STOCK_INDICES } from '../data/gameData';
import { fmt, portfolioValue } from '../utils/gameLogic';

export default function StockMarket({ state, onBuy, onSell }) {
  const [shares, setShares] = useState(1);
  const qty = Math.max(1, Math.min(99, Math.floor(Number(shares) || 1)));
  const prices = state.stockPrices || {};
  const portfolio = state.portfolio || {};
  const total = portfolioValue(portfolio, prices);

  return (
    <section className="panel stock-panel">
      <div className="panel-header">
        <h2>Sector Exchange</h2>
        <span className="badge">{fmt(total)} cr</span>
      </div>
      <p className="muted intel-blurb">
        Indices shift every jump with seasons and noise. Counts toward net worth.
      </p>

      <div className="futures-form" style={{ marginBottom: '0.55rem' }}>
        <label htmlFor="stock-qty" className="muted">
          Shares
        </label>
        <input
          id="stock-qty"
          className="row-qty"
          type="number"
          min={1}
          max={99}
          value={shares}
          disabled={state.gameOver}
          onChange={(e) => setShares(e.target.value)}
        />
      </div>

      <ul className="stock-list">
        {Object.values(STOCK_INDICES).map((idx) => {
          const unit = prices[idx.id] ?? idx.base;
          const owned = portfolio[idx.id] || 0;
          const cost = unit * qty;
          return (
            <li key={idx.id}>
              <div>
                <strong>{idx.name}</strong>
                <span className="muted">{idx.blurb}</span>
                <span className="upgrade-meta">
                  {fmt(unit)} cr · own {owned}
                </span>
              </div>
              <div className="quest-actions">
                <button
                  type="button"
                  className="btn btn-buy btn-xs"
                  disabled={
                    state.gameOver ||
                    state.needsHullSelect ||
                    cost > state.credits
                  }
                  onClick={() => onBuy(idx.id, qty)}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className="btn btn-sell btn-xs"
                  disabled={
                    state.gameOver ||
                    state.needsHullSelect ||
                    owned < qty
                  }
                  onClick={() => onSell(idx.id, qty)}
                >
                  Sell
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
