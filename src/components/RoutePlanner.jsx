import { useState } from 'react';
import { Box, Button, Flex, Grid, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { PLANETS } from '../data/gameData';
import { estimateRoute, fmt, travelFuelForState } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function RoutePlanner({ state, onSaveRoute, onNextHop }) {
  const [draft, setDraft] = useState(() => state.route || []);
  const fuelCost = travelFuelForState(state);

  const estimate = estimateRoute(
    state.currentPlanet,
    draft,
    state.fuel,
    state.maxFuel,
    fuelCost
  );

  const savedEstimate = estimateRoute(
    state.currentPlanet,
    (state.route || []).slice(state.routeCursor || 0),
    state.fuel,
    state.maxFuel,
    fuelCost
  );

  function addPlanet(planet) {
    setDraft((d) => [...d, planet]);
  }

  function removeLast() {
    setDraft((d) => d.slice(0, -1));
  }

  function clearDraft() {
    setDraft([]);
  }

  return (
    <GamePanel
      title="Trade Route"
      icon="🗺️"
      badge={`${fuelCost} fuel / hop`}
      badgeMuted
    >
      <VStack align="stretch" gap={3}>
        <Text color="#8b9bb8" fontSize="0.9rem">
          Build a multi-stop plan, review fuel/turns, then fly hop-by-hop.
        </Text>

        <VStack align="stretch" gap={2} p={2} bg="#0f1626" borderRadius="6px">
          <Text color="#e8eef8" fontSize="0.9rem" fontFamily="mono">
            {state.currentPlanet}
            {draft.length ? ` → ${draft.join(' → ')}` : ' → …'}
          </Text>
          <Text color="#8b9bb8" fontSize="0.85rem">
            {estimate.summary}
          </Text>
          {!estimate.fuelOk && estimate.jumps > 0 && (
            <Text color="#f07178" fontSize="0.82rem">
              Need ~{fmt(estimate.fuelNeeded)} fuel (have {state.fuel}). Plan refuels.
            </Text>
          )}
        </VStack>

        <Wrap gap={1}>
          {PLANETS.map((p) => (
            <WrapItem key={p}>
              <Button
                size="xs"
                bg="#2e4a7a"
                color="#e8eef8"
                border="1px solid #243049"
                _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
                isDisabled={state.gameOver}
                onClick={() => addPlanet(p)}
              >
                + {p}
              </Button>
            </WrapItem>
          ))}
        </Wrap>

        <Flex gap={2} wrap="wrap">
          <Button
            bg="#2e4a7a"
            color="#e8eef8"
            border="1px solid #243049"
            _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
            isDisabled={!draft.length}
            onClick={removeLast}
          >
            ↩️ Undo stop
          </Button>
          <Button
            bg="#2e4a7a"
            color="#e8eef8"
            border="1px solid #243049"
            _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
            isDisabled={!draft.length}
            onClick={clearDraft}
          >
            🗑️ Clear
          </Button>
          <Button
            bg="#4cc9f0"
            color="#070b14"
            _hover={{ bg: '#3db8d8' }}
            isDisabled={state.gameOver || draft.length < 1}
            onClick={() => onSaveRoute(draft)}
          >
            💾 Save route
          </Button>
        </Flex>

        {(state.route || []).length > 0 && (
          <VStack align="stretch" gap={2} p={3} bg="#141e33" borderRadius="8px" border="1px solid #243049">
            <Text fontWeight="600" color="#e8eef8" fontSize="0.95rem">
              📍 Active route
            </Text>
            <Text color="#8b9bb8" fontSize="0.9rem" fontFamily="mono" wordBreak="break-word">
              {(state.route || []).map((p, i) => (
                <Text
                  key={`${p}-${i}`}
                  as="span"
                  color={i === (state.routeCursor || 0) ? '#4cc9f0' : '#8b9bb8'}
                  fontWeight={i === (state.routeCursor || 0) ? '600' : 'normal'}
                >
                  {i > 0 ? ' → ' : ''}
                  {p}
                </Text>
              ))}
            </Text>
            <Text color="#8b9bb8" fontSize="0.85rem">
              Remaining: {savedEstimate.summary}
            </Text>
            <Button
              bg="#2dd4a8"
              color="#070b14"
              _hover={{ bg: '#23b392' }}
              isDisabled={state.gameOver || state.fuel < fuelCost}
              onClick={onNextHop}
              w="100%"
            >
              🚀 Next hop
            </Button>
          </VStack>
        )}
      </VStack>
    </GamePanel>
  );
}
