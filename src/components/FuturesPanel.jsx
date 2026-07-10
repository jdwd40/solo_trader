import { useState } from 'react';
import { VStack, HStack, Text, Button, Select } from '@chakra-ui/react';
import {
  FUTURES_DURATION,
  FUTURES_FEE_RATE,
  LEGAL_COMMODITIES,
  MAX_FUTURES,
} from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function FuturesPanel({ state, onOpen, onSettle }) {
  const [commodity, setCommodity] = useState(LEGAL_COMMODITIES[0]);
  const [qty, setQty] = useState(5);
  const price = state.prices[state.currentPlanet][commodity];
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const fee = Math.max(1, Math.round(price * safeQty * FUTURES_FEE_RATE));
  const openCount = (state.futures || []).length;
  const canOpen =
    !state.gameOver &&
    openCount < MAX_FUTURES &&
    state.credits >= fee;

  return (
    <GamePanel
      title="📑 Futures"
      badge={`${openCount}/${MAX_FUTURES} · ${FUTURES_DURATION} jumps`}
      badgeMuted
    >
      <VStack gap={4} align="stretch">
        {/* Description */}
        <Text color="#8b9bb8" fontSize="sm">
          Lock a sale price now (fee {Math.round(FUTURES_FEE_RATE * 100)}%).
          Deliver cargo later from any planet to settle.
        </Text>

        {/* Form */}
        <HStack gap={2} align="flex-end">
          <Select
            value={commodity}
            isDisabled={state.gameOver}
            onChange={(e) => setCommodity(e.target.value)}
            bg="#141e33"
            borderColor="#243049"
            color="#e8eef8"
            size="sm"
            flex={1}
          >
            {LEGAL_COMMODITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <input
            type="number"
            min={1}
            max={99}
            value={qty}
            disabled={state.gameOver}
            onChange={(e) => setQty(e.target.value)}
            aria-label="Futures quantity"
            style={{
              background: '#141e33',
              border: '1px solid #243049',
              color: '#e8eef8',
              padding: '8px 12px',
              borderRadius: '6px',
              width: '80px',
              fontSize: '14px',
            }}
          />
          <Button
            size="sm"
            isDisabled={!canOpen}
            onClick={() => onOpen(commodity, safeQty)}
            title={`Lock ${safeQty} @ ${fmt(price)} · fee ${fmt(fee)}`}
            bg="#4cc9f0"
            color="#070b14"
            _hover={{ bg: '#5dd9ff' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            fontWeight="bold"
            whiteSpace="nowrap"
          >
            📑 Open ({fmt(fee)})
          </Button>
        </HStack>

        {/* Hint */}
        <Text color="#8b9bb8" fontSize="xs">
          Spot here: {fmt(price)} · Lock total {fmt(price * safeQty)}
        </Text>

        {/* Futures list */}
        {(state.futures || []).length === 0 ? (
          <Text color="#8b9bb8" fontSize="sm">
            No open contracts.
          </Text>
        ) : (
          <VStack gap={2} align="stretch">
            {state.futures.map((f) => {
              const owned = state.cargo[f.commodity] || 0;
              const canSettle = !state.gameOver && owned > 0;
              return (
                <HStack
                  key={f.id}
                  justify="space-between"
                  align="center"
                  p={3}
                  bg="#141e33"
                  borderRadius="6px"
                  borderLeft="3px solid #4cc9f0"
                >
                  <VStack gap={1} align="flex-start" flex={1}>
                    <Text fontSize="sm" fontWeight="bold" color="#e8eef8">
                      {f.qty}× {f.commodity} @ {fmt(f.lockedPrice)}
                    </Text>
                    <Text fontSize="xs" color="#8b9bb8">
                      {f.turnsLeft} jump{f.turnsLeft === 1 ? '' : 's'} left · opened {f.openedAt}
                    </Text>
                  </VStack>
                  <Button
                    size="xs"
                    isDisabled={!canSettle}
                    onClick={() => onSettle(f.id)}
                    title={
                      canSettle
                        ? `Settle up to ${Math.min(owned, f.qty)}`
                        : 'Need cargo to settle'
                    }
                    bg="#2dd4a8"
                    color="#070b14"
                    _hover={{ bg: '#3fe4b8' }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    fontWeight="bold"
                  >
                    ✅ Settle
                  </Button>
                </HStack>
              );
            })}
          </VStack>
        )}
      </VStack>
    </GamePanel>
  );
}
