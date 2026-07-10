import { useState } from 'react';
import { Box, Button, Flex, Select, Text, VStack } from '@chakra-ui/react';
import { INTEL_COST, LEGAL_COMMODITIES } from '../data/gameData';
import { comparePlanetPrices, fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function MarketIntel({ state, onBuyIntel }) {
  const [focus, setFocus] = useState(LEGAL_COMMODITIES[0]);
  const active = state.intelActive;

  const rows = active
    ? comparePlanetPrices(state.prices, state.currentPlanet, focus)
    : [];

  const localPrice = state.prices[state.currentPlanet][focus];

  return (
    <GamePanel
      title="Market Intel"
      icon="📡"
      badge={active ? 'Active' : `${fmt(INTEL_COST)} cr`}
      badgeMuted={!active}
    >
      <VStack align="stretch" gap={3}>
        <Text color="#8b9bb8" fontSize="0.9rem">
          Pay for a sector scan of relative prices. Expires when you jump.
        </Text>

        {!active ? (
          <Button
            bg="#4cc9f0"
            color="#070b14"
            _hover={{ bg: '#3db8d8' }}
            isDisabled={state.gameOver || state.credits < INTEL_COST}
            onClick={onBuyIntel}
          >
            📡 Buy Intel ({fmt(INTEL_COST)} cr)
          </Button>
        ) : (
          <VStack align="stretch" gap={3}>
            <Flex gap={3} align="flex-end">
              <VStack align="stretch" flex={1} gap={1}>
                <Text as="label" htmlFor="intel-commodity" fontWeight="600" color="#e8eef8" fontSize="0.9rem">
                  📦 Commodity
                </Text>
                <Select
                  id="intel-commodity"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  bg="#141e33"
                  border="1px solid #243049"
                  color="#e8eef8"
                  _focus={{ borderColor: '#4cc9f0' }}
                >
                  {LEGAL_COMMODITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </VStack>
              <VStack align="flex-end" gap={0.5}>
                <Text fontSize="0.75rem" color="#8b9bb8">
                  Here:
                </Text>
                <Text fontWeight="600" color="#4cc9f0" fontSize="0.95rem">
                  {fmt(localPrice)}
                </Text>
              </VStack>
            </Flex>

            <VStack gap={1.5} align="stretch">
              {rows.map((row) => {
                const labelColor =
                  row.label === 'cheaper' ? '#2dd4a8' :
                  row.label === 'dearer' ? '#f0a04b' :
                  '#8b9bb8';
                const labelText =
                  row.label === 'cheaper' ? '▼ cheaper' :
                  row.label === 'dearer' ? '▲ dearer' :
                  '≈ similar';

                return (
                  <Flex
                    key={row.planet}
                    justify="space-between"
                    align="center"
                    p={2}
                    bg="#0f1626"
                    border="1px solid #243049"
                    borderRadius="6px"
                  >
                    <Text color="#e8eef8" fontWeight="500">
                      {row.planet}
                    </Text>
                    <Text color="#4cc9f0" fontFamily="mono" fontSize="0.9rem">
                      {fmt(row.price)}
                    </Text>
                    <Text color={labelColor} fontWeight="500" fontSize="0.85rem">
                      {labelText}
                    </Text>
                  </Flex>
                );
              })}
            </VStack>
          </VStack>
        )}
      </VStack>
    </GamePanel>
  );
}
