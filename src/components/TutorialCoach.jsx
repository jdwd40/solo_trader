import { useEffect, useState } from 'react';
import { TUTORIAL_KEY } from '../data/gameData';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome, Captain',
    body: 'You run a solo trading company. Goal: highest net worth after 100 turns. Net worth = credits + cargo − debt.',
    target: null,
  },
  {
    id: 'buy',
    title: 'Step 1 — Buy low',
    body: 'Use the Market table. Pick a cheap good (watch sparklines), set qty, and hit Buy. Try Food or Ore to start.',
    target: 'market',
  },
  {
    id: 'travel',
    title: 'Step 2 — Travel',
    body: 'Jump to another planet (costs 10 fuel + 1 turn). Prices reshuffle every jump. Refuel with Fuel Cells when low.',
    target: 'travel',
  },
  {
    id: 'sell',
    title: 'Step 3 — Sell high',
    body: 'Sell where prices are better. Use Market Intel, demand events, and futures to plan routes. Skip this coach anytime.',
    target: 'market',
  },
  {
    id: 'done',
    title: 'You are cleared for launch',
    body: 'Explore loans, upgrades, black markets, and futures when ready. Replay this coach from Game controls.',
    target: null,
  },
];

export function isTutorialDone() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearTutorialDone() {
  try {
    localStorage.removeItem(TUTORIAL_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * First-run coach. `forceOpen` restarts from Game controls.
 */
export default function TutorialCoach({
  state,
  forceOpen,
  onForceConsumed,
}) {
  const [open, setOpen] = useState(() => !isTutorialDone());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      onForceConsumed?.();
    }
  }, [forceOpen, onForceConsumed]);

  // Auto-advance on key actions
  useEffect(() => {
    if (!open) return;
    const legalCargo = Object.entries(state.cargo || {}).some(
      ([k, v]) => k !== 'Contraband' && v > 0
    );
    if (step === 1 && legalCargo) setStep(2);
    if (step === 2 && state.turn > 1) setStep(3);
    if (step === 3 && legalCargo === false && state.turn > 1) {
      // sold everything after travel — soft advance
    }
  }, [state.cargo, state.turn, open, step]);

  if (!open) return null;

  const current = STEPS[step] || STEPS[0];
  const isLast = step >= STEPS.length - 1;

  function finish() {
    markTutorialDone();
    setOpen(false);
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="tutorial-root" role="dialog" aria-label="Tutorial">
      {current.target && (
        <div className={`tutorial-spotlight target-${current.target}`} />
      )}
      <div className="tutorial-card">
        <p className="tutorial-kicker">
          Coach · {step + 1}/{STEPS.length}
        </p>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <div className="tutorial-actions">
          <button type="button" className="btn btn-secondary" onClick={finish}>
            Skip
          </button>
          <button type="button" className="btn btn-primary" onClick={next}>
            {isLast ? 'Start trading' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
