import { useState } from 'react';
import { COMMODITY_ICONS, LEGAL_COMMODITIES } from '../data/gameData';
import { cargoUsed, fmt, maxBuyQty } from '../utils/gameLogic';
import Sparkline from './Sparkline';

function defaultQtys() {
  return Object.fromEntries(LEGAL_COMMODITIES.map((c) => [c, 1]));
}

export default function MarketTable({ state, onBuy, onSell }) {
  const [qtys, setQtys] = useState(defaultQtys);
  const prices = state.prices[state.currentPlanet];
  const history = state.priceHistory?.[state.currentPlanet] || {};
  const used = cargoUsed(state.cargo);
  const free = state.cargoCapacity - used;
  const demands = (state.demandEvents || []).filter(
    (e) => e.planet === state.currentPlanet
  );

  function setQty(commodity, value) {
    const n = Math.max(1, Math.min(999, Math.floor(Number(value) || 1)));
    setQtys((prev) => ({ ...prev, [commodity]: n }));
  }

  function qtyOf(commodity) {
    return Math.max(1, Math.min(999, Math.floor(Number(qtys[commodity]) || 1)));
  }

  function demandTag(commodity) {
    const ev = demands.find((d) => d.commodity === commodity);
    if (!ev) return null;
    return (
      <span
        className={`demand-pill ${ev.type}`}
        title={`${ev.type} · ${ev.turnsLeft} turns left · ×${ev.factor}`}
      >
        {ev.type === 'shortage' ? '📈' : '📉'}
      </span>
    );
  }

  return (
    <section className="panel market-panel" data-tutorial="market">
      <div className="panel-header">
        <h2>Market — {state.currentPlanet}</h2>
        <span className="badge muted-badge">Legal goods</span>
      </div>

      {demands.length > 0 && (
        <div className="demand-banner">
          {demands.map((d) => (
            <span key={d.id} className={`demand-chip ${d.type}`}>
              {d.type === 'shortage' ? 'Shortage' : 'Surplus'}: {d.commodity} (
              {d.turnsLeft}t)
            </span>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th>Commodity</th>
              <th>Price</th>
              <th>Trend</th>
              <th>Owned</th>
              <th>Qty</th>
              <th>Buy</th>
              <th>Sell</th>
            </tr>
          </thead>
          <tbody>
            {LEGAL_COMMODITIES.map((commodity) => {
              const price = prices[commodity];
              const owned = state.cargo[commodity] || 0;
              const qty = qtyOf(commodity);
              const maxBuy = maxBuyQty(state.credits, free, price);
              const cost = price * qty;
              const canBuy = !state.gameOver && qty <= maxBuy && maxBuy > 0;
              const canSell = !state.gameOver && owned >= qty && qty > 0;
              const series = history[commodity] || [price];

              return (
                <tr key={commodity}>
                  <td className="commodity-name">
                    <span className="icon-label" aria-hidden="true">
                      {COMMODITY_ICONS[commodity] || '📦'}
                    </span>{' '}
                    {commodity} {demandTag(commodity)}
                  </td>
                  <td className="price">{fmt(price)}</td>
                  <td className="trend-cell">
                    <Sparkline values={series} />
                  </td>
                  <td className="owned">{owned}</td>
                  <td>
                    <input
                      className="row-qty"
                      type="number"
                      min={1}
                      max={999}
                      value={qtys[commodity] ?? 1}
                      disabled={state.gameOver}
                      onChange={(e) => setQty(commodity, e.target.value)}
                      aria-label={`${commodity} quantity`}
                    />
                  </td>
                  <td className="action-cell">
                    <div className="action-stack">
                      <button
                        type="button"
                        className="btn btn-buy"
                        disabled={!canBuy}
                        title={
                          canBuy
                            ? `Buy ${qty} for ${fmt(cost)}`
                            : 'Not enough credits or cargo space'
                        }
                        onClick={() => onBuy(commodity, qty)}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        className="btn btn-buy btn-xs"
                        disabled={state.gameOver || maxBuy <= 0}
                        title={
                          maxBuy > 0
                            ? `Buy max ${maxBuy}`
                            : 'Cannot buy any'
                        }
                        onClick={() => {
                          if (maxBuy > 0) {
                            setQty(commodity, maxBuy);
                            onBuy(commodity, maxBuy);
                          }
                        }}
                      >
                        Max
                      </button>
                    </div>
                  </td>
                  <td className="action-cell">
                    <div className="action-stack">
                      <button
                        type="button"
                        className="btn btn-sell"
                        disabled={!canSell}
                        title={
                          canSell
                            ? `Sell ${qty} for ${fmt(price * qty)}`
                            : 'Not enough cargo to sell'
                        }
                        onClick={() => onSell(commodity, qty)}
                      >
                        Sell
                      </button>
                      <button
                        type="button"
                        className="btn btn-sell btn-xs"
                        disabled={state.gameOver || owned <= 0}
                        title={owned > 0 ? `Sell all ${owned}` : 'Nothing to sell'}
                        onClick={() => {
                          if (owned > 0) {
                            setQty(commodity, owned);
                            onSell(commodity, owned);
                          }
                        }}
                      >
                        All
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
