import { useEffect, useRef, useState } from 'react';
import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
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
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="#070b14"
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      <Box
        bg="#0f1626"
        borderRadius="8px"
        p="2rem"
        maxW="800px"
        maxH="90vh"
        overflowY="auto"
        border="1px solid #243049"
      >
        <VStack gap="1.5rem" align="stretch">
          {/* Header */}
          <VStack gap="0.75rem" align="stretch">
            <Text fontSize="sm" color="#8b9bb8" fontWeight="500">
              🏁 Voyage Complete
            </Text>
            <Heading as="h2" id="game-over-title" fontSize="2xl" color="#e8eef8">
              🏆 Final Score
            </Heading>
            <Text color="#e8eef8" fontSize="0.95rem">
              {state.companyName}
              {state.shipTitle ? ` · ${state.shipTitle}` : ''}
              {hull ? ` · ${hull.name}` : ''}
              {state.runMode === 'daily' ? ` · Daily ${state.rngSeed}` : ''}
            </Text>
          </VStack>

          {/* Epilogue Block */}
          <Box bg="#141e33" p="1.25rem" borderRadius="6px" border="1px solid #243049">
            <Text color="#8b9bb8" fontSize="sm" fontWeight="500">
              📖 Epilogue
            </Text>
            <Text color="#4cc9f0" fontSize="1.1rem" fontWeight="bold" mt="0.5rem">
              {epilogue.title}
            </Text>
            <Text color="#e8eef8" fontSize="0.95rem" mt="0.75rem" lineHeight="1.6">
              {epilogue.text}
            </Text>
          </Box>

          {/* Score Grid */}
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="1rem">
            {[
              { label: '💰 Credits', value: fmt(state.credits) },
              { label: '📦 Ship cargo', value: fmt(cargoVal) },
              { label: '🏭 Warehouses', value: fmt(whVal) },
              { label: '📈 Stocks', value: fmt(stockVal) },
              { label: '📉 Debt', value: fmt(debt), isDebt: debt > 0 },
              {
                label: '⭐ Reputation',
                value: `${reputationLabel(state.reputation ?? 55)} (${state.reputation ?? 55})`,
              },
            ].map((item) => (
              <Box key={item.label} bg="#141e33" p="1rem" borderRadius="6px" border="1px solid #243049">
                <Text color="#8b9bb8" fontSize="sm" fontWeight="500">
                  {item.label}
                </Text>
                <Text
                  color={item.isDebt ? "#f07178" : "#e8eef8"}
                  fontSize="1.25rem"
                  fontWeight="bold"
                  mt="0.5rem"
                >
                  {item.value}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Net Worth Highlight */}
          <Box
            bg="linear-gradient(135deg, #2e4a7a 0%, #1a2942 100%)"
            p="1.5rem"
            borderRadius="6px"
            border="1px solid #2e4a7a"
          >
            <Text color="#8b9bb8" fontSize="sm" fontWeight="500">
              💎 Net Worth
            </Text>
            <Text color="#4cc9f0" fontSize="2rem" fontWeight="bold" mt="0.5rem">
              {fmt(netWorth)}
            </Text>
          </Box>

          {/* Rating Block */}
          <Box bg="#141e33" p="1.25rem" borderRadius="6px" border="1px solid #243049">
            <Text color="#8b9bb8" fontSize="sm" fontWeight="500">
              🎖️ Rating
            </Text>
            <Text color="#4cc9f0" fontSize="1.5rem" fontWeight="bold" mt="0.5rem">
              {rating}
            </Text>
          </Box>

          <RunAnalytics analytics={analytics} />

          <ReplayCodePanel
            code={replayCode}
            onCopy={() => setCopyMsg('Code copied.')}
          />
          {copyMsg ? (
            <Text color="#e8eef8" fontSize="0.95rem">
              {copyMsg}
            </Text>
          ) : null}

          <PrestigePanel gained={gained} />

          {state.runMode === 'daily' && dailyScores.length > 0 ? (
            <Box bg="#141e33" p="1.25rem" borderRadius="6px" border="1px solid #243049">
              <Heading as="h3" fontSize="1.1rem" color="#e8eef8" mb="1rem">
                📅 Daily leaderboard ({state.rngSeed})
              </Heading>
              <Box as="ol" pl="1.5rem">
                {dailyScores.slice(0, 5).map((s, i) => (
                  <Box key={`d-${s.date}-${i}`} display="flex" gap="1rem" mb="0.75rem" color="#e8eef8" fontSize="0.95rem">
                    <Text fontWeight="bold" minW="40px">#{i + 1}</Text>
                    <VStack align="flex-start" gap="0" flex="1">
                      <Text fontWeight="bold">{s.companyName}</Text>
                      <Text color="#8b9bb8" fontSize="0.85rem">{s.epilogue || s.rating}</Text>
                    </VStack>
                    <Text fontWeight="bold">{fmt(s.netWorth)}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}

          {/* All-time Leaderboard */}
          <Box bg="#141e33" p="1.25rem" borderRadius="6px" border="1px solid #243049">
            <Heading as="h3" fontSize="1.1rem" color="#e8eef8" mb="1rem">
              🏆 All-time leaderboard
            </Heading>
            {scores.length === 0 ? (
              <Text color="#8b9bb8" fontSize="0.95rem">
                No scores saved.
              </Text>
            ) : (
              <Box as="ol" pl="1.5rem">
                {scores.slice(0, 5).map((s, i) => (
                  <Box key={`${s.date}-${i}`} display="flex" gap="1rem" mb="0.75rem" color="#e8eef8" fontSize="0.95rem">
                    <Text fontWeight="bold" minW="40px">#{i + 1}</Text>
                    <VStack align="flex-start" gap="0" flex="1">
                      <Text fontWeight="bold">{s.companyName}</Text>
                      <Text color="#8b9bb8" fontSize="0.85rem">{s.rating}</Text>
                    </VStack>
                    <Text fontWeight="bold">{fmt(s.netWorth)}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* New Game Button */}
          <Button
            bg="#4cc9f0"
            color="#070b14"
            fontWeight="bold"
            px="2rem"
            py="1.5rem"
            fontSize="1rem"
            w="100%"
            _hover={{ bg: "#3bb8dd" }}
            onClick={onNewGame}
          >
            🚀 Start New Game
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
