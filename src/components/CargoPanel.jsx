import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { COMMODITIES, COMMODITY_ICONS, CONTRABAND } from '../data/gameData';
import { cargoUsed, cargoValue, fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function CargoPanel({ state }) {
  const used = cargoUsed(state.cargo);
  const prices = state.prices[state.currentPlanet];
  const value = cargoValue(state.cargo, prices);
  const filled = COMMODITIES.filter((c) => (state.cargo[c] || 0) > 0);
  const pct = Math.min(100, Math.round((used / state.cargoCapacity) * 100));

  return (
    <GamePanel title="Cargo Hold" badge={`${used} / ${state.cargoCapacity}`}>
      {/* Cargo bar */}
      <Box
        h="8px"
        bg="#070b14"
        borderRadius="full"
        overflow="hidden"
        mb={3}
        border="1px solid"
        borderColor="#243049"
        aria-hidden="true"
      >
        <Box
          h="100%"
          bg="linear-gradient(90deg, #4cc9f0, #3ab8e0)"
          borderRadius="full"
          transition="width 0.2s ease"
          w={`${pct}%`}
        />
      </Box>

      {filled.length === 0 ? (
        <Text color="#8b9bb8" fontSize="0.9rem" mb={3}>Hold is empty. Buy goods at the market.</Text>
      ) : (
        <VStack as="ul" listStyleType="none" m={0} p={0} gap={1.5} align="stretch">
          {filled.map((c) => (
            <Flex
              as="li"
              key={c}
              align="center"
              gap={3}
              px={2.5}
              py={2}
              bg="#070b14"
              borderRadius="8px"
              border="1px solid"
              borderColor={c === CONTRABAND ? 'rgba(240, 113, 120, 0.4)' : '#243049'}
              bgColor={c === CONTRABAND ? 'rgba(240, 113, 120, 0.06)' : '#070b14'}
              fontSize="0.9rem"
            >
              <Text flex={1}>
                <Text as="span" aria-hidden="true">{COMMODITY_ICONS[c] || '📦'}</Text> {c}
              </Text>
              <Text fontFamily="mono" color="#4cc9f0">x{state.cargo[c]}</Text>
              <Text fontFamily="mono" color="#8b9bb8">{fmt(state.cargo[c] * (prices[c] || 0))} cr</Text>
            </Flex>
          ))}
        </VStack>
      )}

      <Flex
        justify="space-between"
        mt={3}
        pt={3}
        borderTop="1px solid"
        borderColor="#243049"
        fontSize="0.9rem"
        color="#8b9bb8"
      >
        <Text>Market value</Text>
        <Text as="strong" color="#e8eef8" fontFamily="mono">{fmt(value)} cr</Text>
      </Flex>
    </GamePanel>
  );
}
