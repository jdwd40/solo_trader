import { useState } from 'react';
import { STOCK_INDICES } from '../data/gameData';
import { fmt, marketBook, portfolioValue } from '../utils/gameLogic';

/**
 * Sector Exchange — real bid/ask microstructure.
 *
 * - Buy  = take the market ask (you pay up for immediacy)
 * - Sell = hit the market bid (you give up for immediacy)
 * - Make 2-way = post both bid & ask; other traders may fill you on jumps
 *   (you earn the spread when both sides fill; adverse selection when mid runs)
 */
export default function StockMarket({
  state,
  onBuy,
  onSell,
  onPostQuote,
  onPullQuote,
}) {
  const [shares, setShares] = useState(1);
  const [mmSize, setMmSize] = useState(3);
  const qty = Math.max(1, Math.min(99, Math.floor(Number(shares) || 1)));
  const quoteSize = Math.max(1, Math.min(99, Math.floor(Number(mmSize) || 1)));
  const prices = state.stockPrices || {};
  const portfolio = state.portfolio || {};
  const quotes = state.stockQuotes || {};
  const total = portfolioValue(portfolio, prices);
  const locked = state.gameOver || state.needsHullSelect;

  return (
    <section className="panel stock-panel">
      <div className="panel-header">
        <h2>📈 Sector Exchange</h2>
        <span className="badge">{fmt(total)} cr</span>
      </div>
      <p className="muted intel-blurb">
        <strong>Take the ask</strong> to buy. <strong>Hit the bid</strong> to sell.
        Or <strong>make a 2-way market</strong> — post both sides and let flow
        trade against you on jumps (spread income, inventory risk).
      </p>

      <div className="futures-form stock-qty-row">
        <label htmlFor="stock-qty" className="muted">
          ⚡ Take size
        </label>
        <input
          id="stock-qty"
          className="row-qty"
          type="number"
          min={1}
          max={99}
          value={shares}
          disabled={locked}
          onChange={(e) => setShares(e.target.value)}
        />
        <label htmlFor="mm-qty" className="muted">
          🏦 Quote size
        </label>
        <input
          id="mm-qty"
          className="row-qty"
          type="number"
          min={1}
          max={99}
          value={mmSize}
          disabled={locked}
          onChange={(e) => setMmSize(e.target.value)}
        />
      </div>

      <ul className="stock-list">
        {Object.values(STOCK_INDICES).map((idx) => {
          const mid = prices[idx.id] ?? idx.base;
          const book = marketBook(mid, state.season, idx.id);
          const owned = portfolio[idx.id] || 0;
          const takeCost = book.ask * qty;
          const hitRevenue = book.bid * qty;
          const q = quotes[idx.id];
          const making = Boolean(q && (q.bidSize > 0 || q.askSize > 0));

          return (
            <li key={idx.id} className={making ? 'is-quoting' : ''}>
              <div className="stock-main">
                <strong>{idx.name}</strong>
                <span className="muted">{idx.blurb}</span>
                <div className="stock-book" aria-label="Bid ask book">
                  <span className="book-bid" title="Market bid — hit this to sell">
                    Bid <strong>{fmt(book.bid)}</strong>
                  </span>
                  <span className="book-mid" title="Mid / last">
                    Mid {fmt(book.mid)}
                  </span>
                  <span className="book-ask" title="Market ask — take this to buy">
                    Ask <strong>{fmt(book.ask)}</strong>
                  </span>
                  <span className="book-spread muted">
                    Spr {fmt(book.spread)}
                  </span>
                </div>
                <span className="upgrade-meta">
                  Own {owned}
                  {making
                    ? ` · quoting ${q.bidSize || 0}×${q.askSize || 0}`
                    : ''}
                </span>
              </div>

              <div className="stock-actions">
                <div className="quest-actions">
                  <button
                    type="button"
                    className="btn btn-buy btn-xs"
                    disabled={locked || takeCost > state.credits}
                    title={`Take ask: buy ${qty} @ ${fmt(book.ask)} = ${fmt(takeCost)} cr`}
                    onClick={() => onBuy(idx.id, qty)}
                  >
                    📈 Take ask
                  </button>
                  <button
                    type="button"
                    className="btn btn-sell btn-xs"
                    disabled={locked || owned < qty}
                    title={`Hit bid: sell ${qty} @ ${fmt(book.bid)} = ${fmt(hitRevenue)} cr`}
                    onClick={() => onSell(idx.id, qty)}
                  >
                    📉 Hit bid
                  </button>
                </div>
                <div className="quest-actions">
                  <button
                    type="button"
                    className="btn btn-fuel btn-xs"
                    disabled={
                      locked ||
                      owned < quoteSize ||
                      book.bid * quoteSize > state.credits
                    }
                    title={`Post 2-way: bid ${quoteSize}@${fmt(book.bid)} · ask ${quoteSize}@${fmt(book.ask)}. Fills on jumps.`}
                    onClick={() => onPostQuote(idx.id, quoteSize, quoteSize)}
                  >
                    🏦 Make 2-way
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    disabled={locked || !making}
                    title="Cancel resting quotes"
                    onClick={() => onPullQuote(idx.id)}
                  >
                    ✖️ Pull
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
