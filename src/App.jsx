import { useCallback, useEffect, useMemo, useState } from 'react';
import AccessibilityPanel from './components/AccessibilityPanel';
import AutoTradePanel from './components/AutoTradePanel';
import BlackMarketPanel from './components/BlackMarketPanel';
import CargoPanel from './components/CargoPanel';
import CrewPanel from './components/CrewPanel';
import DemandBoard from './components/DemandBoard';
import EventLog from './components/EventLog';
import FuturesPanel from './components/FuturesPanel';
import GameControls from './components/GameControls';
import GameOverScreen from './components/GameOverScreen';
import HighScoreBoard from './components/HighScoreBoard';
import HullSelect from './components/HullSelect';
import InsurancePanel from './components/InsurancePanel';
import LoanPanel from './components/LoanPanel';
import LocationView from './components/LocationView';
import MarketIntel from './components/MarketIntel';
import MarketTable from './components/MarketTable';
import MissionsPanel from './components/MissionsPanel';
import NewsTicker from './components/NewsTicker';
import PirateMap from './components/PirateMap';
import QuestBoard from './components/QuestBoard';
import RivalPanel from './components/RivalPanel';
import RoutePlanner from './components/RoutePlanner';
import SaveSlotsPanel from './components/SaveSlotsPanel';
import SeasonBanner from './components/SeasonBanner';
import ShipUpgrades from './components/ShipUpgrades';
import StatsAchievements from './components/StatsAchievements';
import StatusBar from './components/StatusBar';
import StockMarket from './components/StockMarket';
import TravelPanel from './components/TravelPanel';
import TutorialCoach, { clearTutorialDone } from './components/TutorialCoach';
import WarehousePanel from './components/WarehousePanel';
import WelcomeScreen, {
  clearWelcomeSeen,
  isWelcomeSeen,
} from './components/WelcomeScreen';
import WikiGuide from './components/WikiGuide';
import { DIFFICULTIES, INTEL_COST, PLANETS, getHull } from './data/gameData';
import { useGameState } from './hooks/useGameState';
import {
  deleteSlot,
  downloadSaveFile,
  loadHighScores,
  loadSettings,
  parseImportSave,
  saveSettings,
  travelFuelForState,
} from './utils/gameLogic';
import { dailySeedKey } from './utils/rng';
import { playSfx } from './utils/sound';
import './App.css';

const MOBILE_TABS = [
  { id: 'market', label: 'Market' },
  { id: 'travel', label: 'Travel' },
  { id: 'finance', label: 'Finance' },
  { id: 'ship', label: 'Ship' },
  { id: 'more', label: 'More' },
];

export default function App() {
  const {
    state,
    newGame,
    setDifficulty,
    selectHull,
    switchHull,
    setCompanyName,
    buy,
    sell,
    buyFuel,
    travel,
    buyUpgrade,
    buyIntel,
    borrow,
    repay,
    openFutures,
    settleFutures,
    buyContraband,
    sellContraband,
    buyInsurance,
    unlockWarehouse,
    warehouseDeposit,
    warehouseWithdraw,
    setRoute,
    routeNext,
    acceptQuest,
    completeQuest,
    abandonQuest,
    hireCrew,
    fireCrew,
    buyStock,
    sellStock,
    claimMission,
    setAutoTradeRules,
    setAutoTradeOnArrive,
    runAutoTrade,
    markScoreRecorded,
    saveGame,
    loadGame,
    importGame,
  } = useGameState();

  const [controlMessage, setControlMessage] = useState('');
  const [forceTutorial, setForceTutorial] = useState(false);
  const [showHullSwitch, setShowHullSwitch] = useState(false);
  const [settings, setSettings] = useState(() => loadSettings());
  const [showA11y, setShowA11y] = useState(true);
  const [mobileTab, setMobileTab] = useState('market');
  const [pendingDifficulty, setPendingDifficulty] = useState(
    () => state.difficulty || 'normal'
  );
  // Welcome first; then hull select. Returning players can skip via localStorage.
  const [showWelcome, setShowWelcome] = useState(() => !isWelcomeSeen());
  const [showWiki, setShowWiki] = useState(false);

  const scores = useMemo(
    () => loadHighScores(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.gameOver, state.turn, state.scoreRecorded]
  );

  const onForceConsumed = useCallback(() => setForceTutorial(false), []);

  const play = useCallback(
    (kind) => {
      playSfx(kind, {
        enabled: settings.soundEnabled !== false,
        volume: settings.soundVolume ?? 0.35,
      });
    },
    [settings.soundEnabled, settings.soundVolume]
  );

  function updateSettings(next) {
    setSettings(next);
    saveSettings(next);
  }

  useEffect(() => {
    document.body.classList.toggle('theme-high-contrast', settings.highContrast);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    return () => {
      document.body.classList.remove('theme-high-contrast', 'reduced-motion');
    };
  }, [settings.highContrast, settings.reducedMotion]);

  // React to last event for sound (travel/pirate/buy-ish)
  const lastLogId = state.eventLog?.[0]?.id;
  useEffect(() => {
    if (!lastLogId) return;
    const msg = state.eventLog[0]?.message || '';
    if (msg.includes('Travelled')) play('travel');
    else if (msg.includes('Pirate')) play('pirate');
    else if (msg.includes('Bought')) play('buy');
    else if (msg.includes('Sold') || msg.includes('Settled')) play('sell');
    else if (msg.includes('Contract complete') || msg.includes('Achievement'))
      play('success');
    else if (msg.includes('Cannot') || msg.includes('Need')) play('error');
    else if (msg.includes('Accepted') || msg.includes('contract')) play('quest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLogId]);

  useEffect(() => {
    function onKey(e) {
      if (state.gameOver || state.needsHullSelect) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?') {
        e.preventDefault();
        setShowA11y((v) => !v);
        play('ui');
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setShowWiki(true);
          play('ui');
        }
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setControlMessage(saveGame().message);
          play('ui');
        }
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setControlMessage(loadGame().message);
          play('ui');
        }
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const room = state.maxFuel - state.fuel;
        if (room > 0) buyFuel(room);
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        if (!state.intelActive && state.credits >= INTEL_COST) buyIntel();
        return;
      }
      const num = Number(e.key);
      if (num >= 1 && num <= 6) {
        const dest = PLANETS[num - 1];
        if (
          dest &&
          dest !== state.currentPlanet &&
          state.fuel >= travelFuelForState(state)
        ) {
          e.preventDefault();
          travel(dest);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, saveGame, loadGame, buyFuel, buyIntel, travel, play]);

  function handleNewGame() {
    if (
      window.confirm('Start a new classic game? Unsaved progress will be lost.')
    ) {
      newGame(state.companyName, {
        mode: 'classic',
        difficulty: pendingDifficulty,
      });
      setShowWelcome(true);
      setControlMessage('Classic voyage — welcome back, captain.');
      play('ui');
    }
  }

  function handleNewDaily() {
    const seed = dailySeedKey();
    if (
      window.confirm(
        `Start today's shared daily run (${seed})? Unsaved progress will be lost.`
      )
    ) {
      newGame(state.companyName, {
        mode: 'daily',
        seed,
        difficulty: pendingDifficulty,
      });
      setShowWelcome(true);
      setControlMessage(`Daily run ${seed} — welcome briefing.`);
      play('ui');
    }
  }

  function openWiki() {
    setShowWiki(true);
    play('ui');
  }

  function showIntroAgain() {
    clearWelcomeSeen();
    setShowWelcome(true);
    play('ui');
  }

  function handleSave() {
    setControlMessage(saveGame().message);
    play('ui');
  }

  function handleLoad() {
    if (
      !window.confirm('Load quick-save? Current progress will be replaced.')
    ) {
      return;
    }
    setControlMessage(loadGame().message);
    play('ui');
  }

  function handleExport() {
    try {
      downloadSaveFile(state);
      setControlMessage('Save exported as JSON file.');
      play('success');
    } catch {
      setControlMessage('Export failed.');
      play('error');
    }
  }

  async function handleImportFile(file) {
    try {
      const text = await file.text();
      const game = parseImportSave(text);
      if (
        !window.confirm('Import this save? Current progress will be replaced.')
      ) {
        return;
      }
      setControlMessage(importGame(game).message);
      play('success');
    } catch {
      setControlMessage('Import failed: invalid file.');
      play('error');
    }
  }

  function handleReplayTutorial() {
    clearTutorialDone();
    setForceTutorial(true);
    setControlMessage('Tutorial restarted.');
  }

  const hullName = state.hullId ? getHull(state.hullId).name : '—';

  return (
    <div className={`app mobile-tab-${mobileTab}`}>
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-ship" />
        <div className="app-bg-veil" />
      </div>

      <div className="app-shell">
        <div className="title-row">
          <div>
            <h1 className="app-title">Star Trader Solo</h1>
            <p className="app-subtitle">
              Buy low. Sell high. Survive 100 turns among the stars.
              {state.hullId ? ` · ${hullName}` : ''}
              {state.difficulty
                ? ` · ${DIFFICULTIES[state.difficulty]?.name || state.difficulty}`
                : ''}
              {state.runMode === 'daily' ? ` · Daily` : ''}
            </p>
          </div>
          <div className="title-actions">
            <button type="button" className="btn btn-fuel" onClick={openWiki}>
              Wiki
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={showIntroAgain}
              title="Show welcome / introduction again"
            >
              Intro
            </button>
          </div>
        </div>

        <div className="desktop-sticky-chrome">
          <StatusBar state={state} onRename={setCompanyName} />
          <NewsTicker news={state.news} />
          <SeasonBanner season={state.season} />
        </div>

        <main className="dashboard">
          <div className="col-main">
            <p className="desk-section-label">Docked location</p>
            <div className="mob-section" data-mob="travel">
              <LocationView planet={state.currentPlanet} />
            </div>
            <p className="desk-section-label">Market</p>
            <div className="mob-section" data-mob="market">
              <MarketTable state={state} onBuy={buy} onSell={sell} />
              <AutoTradePanel
                state={state}
                onSaveRules={(rules) => {
                  setAutoTradeRules(rules);
                  setControlMessage('Auto-trade rules saved.');
                  play('ui');
                }}
                onToggleArrive={setAutoTradeOnArrive}
                onRunNow={() => {
                  runAutoTrade();
                  play('ui');
                }}
              />
            </div>
            <p className="desk-section-label">Travel & contracts</p>
            <div className="mob-section desk-travel-grid" data-mob="travel">
              <TravelPanel
                state={state}
                onTravel={travel}
                onBuyFuel={buyFuel}
              />
              <QuestBoard
                state={state}
                onAccept={acceptQuest}
                onComplete={completeQuest}
                onAbandon={abandonQuest}
              />
              <RoutePlanner
                state={state}
                onSaveRoute={setRoute}
                onNextHop={routeNext}
              />
            </div>
            <p className="desk-section-label">Finance & risk</p>
            <div className="mob-section" data-mob="finance">
              <div className="desk-finance-grid">
                <StockMarket
                  state={state}
                  onBuy={buyStock}
                  onSell={sellStock}
                />
                <FuturesPanel
                  state={state}
                  onOpen={openFutures}
                  onSettle={settleFutures}
                />
                <LoanPanel state={state} onBorrow={borrow} onRepay={repay} />
                <InsurancePanel state={state} onBuy={buyInsurance} />
              </div>
              <MarketIntel state={state} onBuyIntel={buyIntel} />
            </div>
          </div>

          <div className="col-side">
            <p className="desk-section-label">Ship & cargo</p>
            <div className="mob-section" data-mob="ship">
              <CargoPanel state={state} />
              <CrewPanel
                state={state}
                onHire={hireCrew}
                onFire={fireCrew}
              />
              <ShipUpgrades state={state} onBuyUpgrade={buyUpgrade} />
              <WarehousePanel
                state={state}
                onUnlock={unlockWarehouse}
                onDeposit={warehouseDeposit}
                onWithdraw={warehouseWithdraw}
              />
              <BlackMarketPanel
                state={state}
                onBuy={buyContraband}
                onSell={sellContraband}
              />
            </div>
            <p className="desk-section-label">Sector & game</p>
            <div className="mob-section" data-mob="more">
              <MissionsPanel
                state={state}
                onClaim={(id) => {
                  claimMission(id);
                  play('success');
                }}
              />
              <RivalPanel rival={state.rival} />
              <PirateMap state={state} />
              <DemandBoard demandEvents={state.demandEvents} />
              <StatsAchievements state={state} />
              {showA11y ? (
                <AccessibilityPanel
                  settings={settings}
                  onChange={updateSettings}
                />
              ) : null}
              <SaveSlotsPanel
                onSaveSlot={(id, label) => {
                  const r = saveGame(id, label);
                  setControlMessage(r.message);
                  if (r.ok) play('success');
                  else play('error');
                  return r;
                }}
                onLoadSlot={(id) => {
                  if (
                    !window.confirm(
                      `Load slot ${id}? Current progress will be replaced.`
                    )
                  ) {
                    return;
                  }
                  const r = loadGame(id);
                  setControlMessage(r.message);
                  if (r.ok) play('success');
                  else play('error');
                }}
                onDeleteSlot={(id) => {
                  if (!window.confirm(`Clear slot ${id}?`)) return;
                  const r = deleteSlot(id);
                  setControlMessage(r.message);
                  play('ui');
                }}
              />
              <EventLog events={state.eventLog} />
              <HighScoreBoard scores={scores} />
              <GameControls
                onNewGame={handleNewGame}
                onNewDaily={handleNewDaily}
                onSave={handleSave}
                onLoad={handleLoad}
                onExport={handleExport}
                onImportFile={handleImportFile}
                onReplayTutorial={handleReplayTutorial}
                onSwitchHull={() => setShowHullSwitch(true)}
                message={controlMessage}
                runMode={state.runMode}
                rngSeed={state.rngSeed}
              />
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <span>
            Open <strong>Wiki</strong> anytime for the field manual. Desktop
            layout uses a sticky status bar and side rail; mobile tabs unchanged.
          </span>
        </footer>
      </div>

      <nav className="mobile-nav" aria-label="Mobile sections">
        {MOBILE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mobile-nav-btn ${mobileTab === t.id ? 'active' : ''}`}
            onClick={() => {
              setMobileTab(t.id);
              play('ui');
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {showWelcome && !state.gameOver ? (
        <WelcomeScreen
          onContinue={() => {
            setShowWelcome(false);
            play('ui');
          }}
          onOpenWiki={() => {
            setShowWiki(true);
            play('ui');
          }}
        />
      ) : null}

      <WikiGuide open={showWiki} onClose={() => setShowWiki(false)} />

      {state.needsHullSelect && !state.gameOver && !showWelcome ? (
        <HullSelect
          mode="start"
          difficulty={state.difficulty || pendingDifficulty}
          onDifficulty={(d) => {
            setPendingDifficulty(d);
            setDifficulty(d);
          }}
          onSelect={(id) => {
            selectHull(id);
            play('success');
          }}
        />
      ) : null}

      {showHullSwitch && !state.needsHullSelect && !state.gameOver ? (
        <HullSelect
          mode="switch"
          currentHullId={state.hullId}
          credits={state.credits}
          onSelect={(id) => {
            switchHull(id);
            setShowHullSwitch(false);
            setControlMessage('Hull switch requested.');
            play('ui');
          }}
          onCancel={() => setShowHullSwitch(false)}
        />
      ) : null}

      <TutorialCoach
        state={state}
        forceOpen={forceTutorial}
        onForceConsumed={onForceConsumed}
      />

      {state.gameOver ? (
        <GameOverScreen
          state={state}
          onNewGame={() =>
            newGame(state.companyName, {
              mode: state.runMode === 'daily' ? 'daily' : 'classic',
              seed:
                state.runMode === 'daily' ? dailySeedKey() : undefined,
              difficulty: state.difficulty || pendingDifficulty,
            })
          }
          onScoreRecorded={markScoreRecorded}
        />
      ) : null}
    </div>
  );
}
