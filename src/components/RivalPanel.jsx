import { Box, Text, VStack } from '@chakra-ui/react';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function RivalPanel({ rival }) {
  if (!rival) return null;

  return (
    <GamePanel
      title="Sector Rival"
      icon="🛰️"
      badge="NPC"
      badgeMuted
    >
      <Text fontWeight={600} color="#e8eef8" mb={3} fontSize="1rem">
        {rival.name}
      </Text>
      <VStack gap={2} align="stretch" mb={4}>
        <Box>
          <Text color="#8b9bb8" fontSize="0.85rem">
            📍 Last seen
          </Text>
          <Text fontWeight={600} color="#e8eef8">
            {rival.planet}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.85rem">
            💰 Est. capital
          </Text>
          <Text fontWeight={600} color="#e8eef8">
            {fmt(rival.credits)} cr
          </Text>
        </Box>
      </VStack>
      <Text color="#8b9bb8" fontSize="0.9rem">
        Rivals jump toward shortages and steal juicy runs. Watch the news ticker.
      </Text>
    </GamePanel>
  );
}
