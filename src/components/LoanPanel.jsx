import { LOAN_INTEREST_RATE, LOAN_OPTIONS, MAX_DEBT } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function LoanPanel({ state, onBorrow, onRepay }) {
  const debt = state.debt || 0;
  const canBorrowBase = !state.gameOver && (state.reputation ?? 55) >= 15;

  return (
    <section className="panel loan-panel">
      <div className="panel-header">
        <h2>💳 Loans</h2>
        <span className="badge muted-badge">
          {LOAN_INTEREST_RATE * 100}% / jump
        </span>
      </div>

      <div className="loan-stats">
        <div>
          <span className="muted">📉 Outstanding</span>
          <strong className={debt > 0 ? 'debt' : ''}>{fmt(debt)} cr</strong>
        </div>
        <div>
          <span className="muted">🏦 Credit limit</span>
          <strong>{fmt(MAX_DEBT)} cr</strong>
        </div>
      </div>

      <div className="loan-actions">
        {LOAN_OPTIONS.map((amt) => {
          const disabled =
            !canBorrowBase || debt + amt > MAX_DEBT;
          return (
            <button
              key={amt}
              type="button"
              className="btn btn-secondary"
              disabled={disabled}
              onClick={() => onBorrow(amt)}
              title={
                disabled
                  ? 'Cannot borrow (limit or reputation)'
                  : `Borrow ${fmt(amt)}`
              }
            >
              💵 +{fmt(amt)}
            </button>
          );
        })}
      </div>

      <div className="loan-repay">
        <button
          type="button"
          className="btn btn-fuel"
          disabled={state.gameOver || debt <= 0 || state.credits <= 0}
          onClick={() => onRepay(Math.min(1000, debt, state.credits))}
        >
          ↩️ Repay 1k
        </button>
        <button
          type="button"
          className="btn btn-fuel"
          disabled={state.gameOver || debt <= 0 || state.credits <= 0}
          onClick={() => onRepay('all')}
        >
          ✅ Repay All
        </button>
      </div>
    </section>
  );
}
