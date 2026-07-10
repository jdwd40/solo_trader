import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
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
import ShipStatus from './components/ShipStatus';
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

const WORKFLOWS = [
  { id: 'trade', icon: '🛒', label: 'Trade', short: 'Trade' },
  { id: 'travel', icon: '🚀', label: 'Travel', short: 'Travel' },
  { id: 'finance', icon: '💹', label: 'Finance', short: 'Finance' },
  { id: 'ship', icon: '🛸', label: 'Ship', short: 'Ship' },
  { id: 'command', icon: '⋯', label: 'Command', short: 'More' },
];

function WorkflowHeading({ label, value }) {
  return (
    <Flex align="flex-end" justify="space-between" gap={3} px={0.5}>
      <Text
        color="brand.400"
        fontSize="0.72rem"
        fontWeight={800}
        letterSpacing="0.12em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text
        color="space.200"
        fontFamily="mono"
        fontSize="0.82rem"
        fontWeight={600}
        truncate
      >
        {value}
      </Text>
    </Flex>
  );
}

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
    postStockQuote,
    pullStockQuote,
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
  const [activeWorkflow, setActiveWorkflow] = useState('trade');
  const [pendingDifficulty, setPendingDifficulty] = useState(
    () => state.difficulty || 'normal'
  );
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
      if (e.key === '?') { e.preventDefault(); setShowA11y((v) => !v); play('ui'); return; }
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowWiki(true); play('ui'); return; }
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setControlMessage(saveGame().message); play('ui'); return; }
      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setControlMessage(loadGame().message); play('ui'); return; }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); const room = state.maxFuel - state.fuel; if (room > 0) buyFuel(room); return; }
      if (e.key === 'i' || e.key === 'I') { e.preventDefault(); if (!state.intelActive && state.credits >= INTEL_COST) buyIntel(); return; }
      const num = Number(e.key);
      if (num >= 1 && num <= 6) {
        const dest = PLANETS[num - 1];
        if (dest && dest !== state.currentPlanet && state.fuel >= travelFuelForState(state)) {
          e.preventDefault();
          travel(dest);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, saveGame, loadGame, buyFuel, buyIntel, travel, play]);

  function handleNewGame() {
    if (window.confirm('Start a new classic game? Unsaved progress will be lost.')) {
      newGame(state.companyName, { mode: 'classic', difficulty: pendingDifficulty });
      setShowWelcome(true);
      setControlMessage('Classic voyage — welcome back, captain.');
      play('ui');
    }
  }

  function handleNewDaily() {
    const seed = dailySeedKey();
    if (window.confirm(`Start today's shared daily run (${seed})? Unsaved progress will be lost.`)) {
      newGame(state.companyName, { mode: 'daily', seed, difficulty: pendingDifficulty });
      setShowWelcome(true);
      setControlMessage(`Daily run ${seed} — welcome briefing.`);
      play('ui');
    }
  }

  function openWiki() { setShowWiki(true); play('ui'); }
  function showIntroAgain() { clearWelcomeSeen(); setShowWelcome(true); play('ui'); }
  function handleSave() { setControlMessage(saveGame().message); play('ui'); }
  function handleLoad() {
    if (!window.confirm('Load quick-save? Current progress will be replaced.')) return;
    setControlMessage(loadGame().message);
    play('ui');
  }
  function handleExport() {
    try { downloadSaveFile(state); setControlMessage('Save exported as JSON file.'); play('success'); }
    catch { setControlMessage('Export failed.'); play('error'); }
  }
  async function handleImportFile(file) {
    try {
      const text = await file.text();
      const game = parseImportSave(text);
      if (!window.confirm('Import this save? Current progress will be replaced.')) return;
      setControlMessage(importGame(game).message);
      play('success');
    } catch { setControlMessage('Import failed: invalid file.'); play('error'); }
  }
  function handleReplayTutorial() { clearTutorialDone(); setForceTutorial(true); setControlMessage('Tutorial restarted.'); }

  const hullName = state.hullId ? getHull(state.hullId).name : '—';
  const cargoUsedNow = Object.values(state.cargo || {}).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

  function workflowMeta(id) {
    if (id === 'trade') return `${cargoUsedNow}/${state.cargoCapacity} cargo`;
    if (id === 'travel') return `${state.fuel}/${state.maxFuel} fuel`;
    if (id === 'finance') return `${state.debt || 0} debt`;
    if (id === 'ship') return hullName;
    return `${state.eventLog?.length || 0} events`;
  }

  const isActive = (id) => activeWorkflow === id;

  return (
    <Box className={`app active-workflow-${activeWorkflow}`} pos="relative" minH="100vh">
      {/* Atmospheric background */}
      <Box className="app-bg" aria-hidden="true">
        <Box className="app-bg-ship" />
        <Box className="app-bg-veil" />
      </Box>

      {/* Main app shell */}
      <Box
        pos="relative"
        zIndex={1}
        maxW={{ base: '100%', md: '1540px', xl: '1600px' }}
        mx="auto"
        px={{ base: 3, md: 6 }}
        pt={{ base: 4, md: 6 }}
        pb={{ base: '5.5rem', md: 10 }}
      >
        {/* Header */}
        <Flex
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={{ base: 3, md: 4 }}
          mb={{ base: 3, md: 4 }}
          direction={{ base: 'column', sm: 'row' }}
        >
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '1.55rem', md: '2rem' }}
              fontWeight={700}
              letterSpacing="0.02em"
              bg="linear-gradient(90deg, #4cc9f0, #3ab8e0)"
              bgClip="text"
              color="transparent"
            >
              Star Trader Solo
            </Heading>
            <Text color="space.200" fontSize={{ base: '0.85rem', md: '0.95rem' }} mt={1}>
              Buy low. Sell high. Survive 100 turns among the stars.
              {state.hullId ? ` · ${hullName}` : ''}
              {state.difficulty ? ` · ${DIFFICULTIES[state.difficulty]?.name || state.difficulty}` : ''}
              {state.runMode === 'daily' ? ' · Daily' : ''}
            </Text>
          </Box>
          <HStack gap={2} flexShrink={0} w={{ base: '100%', sm: 'auto' }}>
            <Button variant="fuel" onClick={openWiki} flex={{ base: 1, sm: 'none' }} minH="44px">
              Wiki
            </Button>
            <Button variant="game" onClick={showIntroAgain} title="Show welcome / introduction again" flex={{ base: 1, sm: 'none' }} minH="44px">
              Intro
            </Button>
          </HStack>
        </Flex>

        {/* Sticky chrome: status + news + season */}
        <Box
          pos="sticky"
          top={0}
          zIndex={20}
          pb={3}
          mb={2}
          bg={{ base: 'rgba(7,11,20,0.96)', md: 'linear-gradient(180deg, rgba(7,11,20,0.97) 70%, rgba(7,11,20,0.85) 100%)' }}
          backdropFilter="blur(10px)"
          mx={{ base: -3, md: 0 }}
          px={{ base: 3, md: 0 }}
          pt={{ base: 2, md: 0 }}
        >
          <StatusBar state={state} onRename={setCompanyName} />
          <NewsTicker news={state.news} />
          <SeasonBanner season={state.season} />
        </Box>

        {/* Main command layout: sidebar | stage | rail */}
        <Grid
          as="main"
          aria-label="Trading command dashboard"
          templateColumns={{ base: '1fr', md: '180px minmax(0, 1fr) minmax(310px, 350px)', xl: '190px minmax(0, 1fr) minmax(340px, 380px)' }}
          gap={{ base: 0, md: 4, xl: 5 }}
          alignItems="start"
          mt={{ base: 0, md: 4 }}
        >
          {/* Desktop sidebar nav */}
            <GridItem as="aside" aria-label="Desktop workflows" display={{ base: 'none', md: 'block' }}>
              <VStack
                pos="sticky"
                top="7.4rem"
                gap={2}
              >
                {WORKFLOWS.map((flow) => (
                  <Button
                    key={flow.id}
                    w="100%"
                    minH="58px"
                    px={3}
                    py={3}
                    variant="game"
                    bg={isActive(flow.id) ? 'rgba(76, 201, 240, 0.12)' : 'rgba(15, 22, 38, 0.88)'}
                    borderColor={isActive(flow.id) ? 'rgba(76, 201, 240, 0.45)' : 'space.500'}
                    color={isActive(flow.id) ? 'brand.400' : 'space.50'}
                    onClick={() => { setActiveWorkflow(flow.id); play('ui'); }}
                    justifyContent="flex-start"
                    gap={3}
                  >
                    <Flex
                      w="34px"
                      h="34px"
                      align="center"
                      justify="center"
                      borderRadius="8px"
                      bg="space.900"
                      border="1px solid"
                      borderColor="space.500"
                      flexShrink={0}
                      aria-hidden="true"
                    >
                      {flow.icon}
                    </Flex>
                    <VStack align="flex-start" gap={0} minW={0}>
                      <Text fontSize="0.88rem" fontWeight={700}>{flow.label}</Text>
                      <Text color="space.200" fontFamily="mono" fontSize="0.72rem" truncate maxW="100%">
                        {workflowMeta(flow.id)}
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </VStack>
            </GridItem>

          {/* Workflow stage */}
          <GridItem as="section" aria-live="polite" minW={0}>
            {/* TRADE */}
            <VStack gap={4} align="stretch" display={isActive('trade') ? 'flex' : 'none'}>
              <WorkflowHeading label="Trade desk" value={state.currentPlanet} />
              <MarketTable state={state} onBuy={buy} onSell={sell} />
              <AutoTradePanel
                state={state}
                onSaveRules={(rules) => { setAutoTradeRules(rules); setControlMessage('Auto-trade rules saved.'); play('ui'); }}
                onToggleArrive={setAutoTradeOnArrive}
                onRunNow={() => { runAutoTrade(); play('ui'); }}
              />
            </VStack>

            {/* TRAVEL */}
            <VStack gap={4} align="stretch" display={isActive('travel') ? 'flex' : 'none'}>
              <WorkflowHeading label="Navigation" value={state.currentPlanet} />
              <LocationView planet={state.currentPlanet} />
              <Grid templateColumns={{ base: '1fr', md: '1.08fr 1fr' }} gap={4}>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <TravelPanel state={state} onTravel={travel} onBuyFuel={buyFuel} />
                </GridItem>
                <QuestBoard state={state} onAccept={acceptQuest} onComplete={completeQuest} onAbandon={abandonQuest} />
                <RoutePlanner state={state} onSaveRoute={setRoute} onNextHop={routeNext} />
              </Grid>
            </VStack>

            {/* FINANCE */}
            <VStack gap={4} align="stretch" display={isActive('finance') ? 'flex' : 'none'}>
              <WorkflowHeading label="Finance and risk" value={state.runMode === 'daily' ? 'Daily run' : 'Classic run'} />
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} alignItems="start">
                <StockMarket state={state} onBuy={buyStock} onSell={sellStock} onPostQuote={postStockQuote} onPullQuote={pullStockQuote} />
                <FuturesPanel state={state} onOpen={openFutures} onSettle={settleFutures} />
                <LoanPanel state={state} onBorrow={borrow} onRepay={repay} />
                <InsurancePanel state={state} onBuy={buyInsurance} />
              </Grid>
              <MarketIntel state={state} onBuyIntel={buyIntel} />
            </VStack>

            {/* SHIP */}
            <VStack gap={4} align="stretch" display={isActive('ship') ? 'flex' : 'none'}>
              <WorkflowHeading label="Ship operations" value={hullName} />
              <Box display={{ base: 'contents', md: 'none' }}>
                <ShipStatus state={state} />
                <CargoPanel state={state} />
              </Box>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} alignItems="start">
                <CrewPanel state={state} onHire={hireCrew} onFire={fireCrew} />
                <ShipUpgrades state={state} onBuyUpgrade={buyUpgrade} />
                <WarehousePanel state={state} onUnlock={unlockWarehouse} onDeposit={warehouseDeposit} onWithdraw={warehouseWithdraw} />
                <BlackMarketPanel state={state} onBuy={buyContraband} onSell={sellContraband} />
              </Grid>
            </VStack>

            {/* COMMAND */}
            <VStack gap={4} align="stretch" display={isActive('command') ? 'flex' : 'none'}>
              <WorkflowHeading label="Command center" value="Run management" />
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} alignItems="start">
                <MissionsPanel state={state} onClaim={(id) => { claimMission(id); play('success'); }} />
                <RivalPanel rival={state.rival} />
                <PirateMap state={state} />
                <DemandBoard demandEvents={state.demandEvents} />
                <StatsAchievements state={state} />
                {showA11y && <AccessibilityPanel settings={settings} onChange={updateSettings} />}
                <SaveSlotsPanel
                  onSaveSlot={(id, label) => { const r = saveGame(id, label); setControlMessage(r.message); if (r.ok) play('success'); else play('error'); return r; }}
                  onLoadSlot={(id) => { if (!window.confirm(`Load slot ${id}? Current progress will be replaced.`)) return; const r = loadGame(id); setControlMessage(r.message); if (r.ok) play('success'); else play('error'); }}
                  onDeleteSlot={(id) => { if (!window.confirm(`Clear slot ${id}?`)) return; const r = deleteSlot(id); setControlMessage(r.message); play('ui'); }}
                />
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
                <Box display={{ base: 'block', md: 'none' }}>
                  <EventLog events={state.eventLog} />
                </Box>
              </Grid>
            </VStack>
          </GridItem>

          {/* Desktop right rail */}
            <GridItem as="aside" aria-label="Ship and event context" display={{ base: 'none', md: 'block' }}>
              <VStack
                pos="sticky"
                top="7.4rem"
                maxH="calc(100vh - 8rem)"
                overflowY="auto"
                gap={4}
                pr={1}
                sx={{
                  scrollbarColor: 'var(--chakra-colors-space-500) transparent',
                  scrollbarWidth: 'thin',
                }}
              >
                <ShipStatus state={state} />
                <CargoPanel state={state} />
                <EventLog events={state.eventLog} />
              </VStack>
            </GridItem>
        </Grid>

        {/* Footer */}
        <Text textAlign="center" color="space.200" fontSize="0.82rem" mt={{ base: 5, md: 7 }}>
          Open <Text as="strong" fontWeight={700}>Wiki</Text> anytime for the field manual. The command dashboard keeps trading, travel, finance, ship, and run tools in focused workspaces.
        </Text>
      </Box>

      {/* Mobile bottom nav */}
        <Grid
          as="nav"
          aria-label="Mobile sections"
          display={{ base: 'grid', md: 'none' }}
          templateColumns="repeat(5, 1fr)"
          pos="fixed"
          bottom={0}
          left={0}
          right={0}
          zIndex={30}
          px={`calc(0.45rem + env(safe-area-inset-right))`}
          pb={`calc(0.4rem + env(safe-area-inset-bottom))`}
          pt={2}
          gap={1}
          bg="rgba(15, 22, 38, 0.98)"
          borderTop="1px solid"
          borderColor="space.500"
          boxShadow="0 -8px 26px rgba(0, 0, 0, 0.42)"
          backdropFilter="blur(10px)"
        >
          {WORKFLOWS.map((t) => (
            <Flex
              key={t.id}
              as="button"
              direction="column"
              align="center"
              justify="center"
              gap={0.5}
              minH="52px"
              borderRadius="10px"
              border="1px solid"
              borderColor={isActive(t.id) ? 'rgba(76, 201, 240, 0.32)' : 'transparent'}
              bg={isActive(t.id) ? 'rgba(76, 201, 240, 0.12)' : 'transparent'}
              color={isActive(t.id) ? 'brand.400' : 'space.200'}
              cursor="pointer"
              fontSize="0.72rem"
              fontWeight={700}
              onClick={() => { setActiveWorkflow(t.id); play('ui'); }}
              _hover={{ bg: 'whiteAlpha.50' }}
              transition="all 0.15s"
            >
              <Text fontSize="1rem" lineHeight={1} aria-hidden="true">{t.icon}</Text>
              <Text>{t.short}</Text>
            </Flex>
          ))}
        </Grid>

      {/* Overlays */}
      {showWelcome && !state.gameOver ? (
        <WelcomeScreen
          onContinue={() => { setShowWelcome(false); play('ui'); }}
          onOpenWiki={() => { setShowWiki(true); play('ui'); }}
        />
      ) : null}

      <WikiGuide open={showWiki} onClose={() => setShowWiki(false)} />

      {state.needsHullSelect && !state.gameOver && !showWelcome ? (
        <HullSelect
          mode="start"
          difficulty={state.difficulty || pendingDifficulty}
          onDifficulty={(d) => { setPendingDifficulty(d); setDifficulty(d); }}
          onSelect={(id) => { selectHull(id); play('success'); }}
        />
      ) : null}

      {showHullSwitch && !state.needsHullSelect && !state.gameOver ? (
        <HullSelect
          mode="switch"
          currentHullId={state.hullId}
          credits={state.credits}
          onSelect={(id) => { switchHull(id); setShowHullSwitch(false); setControlMessage('Hull switch requested.'); play('ui'); }}
          onCancel={() => setShowHullSwitch(false)}
        />
      ) : null}

      <TutorialCoach state={state} forceOpen={forceTutorial} onForceConsumed={onForceConsumed} />

      {state.gameOver ? (
        <GameOverScreen
          state={state}
          onNewGame={() => newGame(state.companyName, {
            mode: state.runMode === 'daily' ? 'daily' : 'classic',
            seed: state.runMode === 'daily' ? dailySeedKey() : undefined,
            difficulty: state.difficulty || pendingDifficulty,
          })}
          onScoreRecorded={markScoreRecorded}
        />
      ) : null}
    </Box>
  );
}
