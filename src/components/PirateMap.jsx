import { Box, Text, VStack } from '@chakra-ui/react';
import { PLANETS } from '../data/gameData';
import { pressureLabel } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function PirateMap({ state }) {
  const pressure = state.lanePressure || {};

  return (
    <GamePanel
      title="Pirate Pressure"
      icon="☠️"
      badge="Dynamic"
      badgeMuted
    >
      <Text color="#8b9bb8" mb={4} fontSize="0.9rem">
        Hot lanes mean more pirate tolls and higher insurance premiums.
      </Text>
      <VStack gap={3} align="stretch">
        {PLANETS.map((p) => {
          const n = Math.round(pressure[p] ?? 25);
          const here = p === state.currentPlanet;
          return (
            <Box key={p} pb={3} borderBottom="1px solid #243049" _last={{ borderBottom: 'none', pb: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Text fontWeight={600} color={here ? '#4cc9f0' : '#e8eef8'} fontSize="0.9rem">
                  {p}
                  {here ? ' · you' : ''}
                </Text>
                <Text color="#8b9bb8" fontSize="0.8rem">
                  {n} · {pressureLabel(n)}
                </Text>
              </Box>
              <Box
                height="6px"
                bg="#1a2844"
                borderRadius="3px"
                overflow="hidden"
                aria-hidden="true"
              >
                <Box
                  height="100%"
                  bg={
                    n > 75
                      ? '#f07178'
                      : n > 50
                      ? '#f0a04b'
                      : n > 25
                      ? '#4cc9f0'
                      : '#2dd4a8'
                  }
                  width={`${n}%`}
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </GamePanel>
  );
}
