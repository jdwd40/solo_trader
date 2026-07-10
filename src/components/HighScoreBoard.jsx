import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function HighScoreBoard({ scores }) {
  return (
    <GamePanel
      title="High Scores"
      icon="🏆"
      badge="Local"
      badgeMuted
    >
      {scores.length === 0 ? (
        <Text color="#8b9bb8">No finished voyages yet. Reach turn 100!</Text>
      ) : (
        <VStack gap={3} align="stretch">
          {scores.map((s, i) => (
            <HStack
              key={`${s.date}-${i}`}
              gap={3}
              pb={3}
              borderBottom="1px solid #243049"
              _last={{ borderBottom: 'none', pb: 0 }}
              justify="space-between"
            >
              <Text fontWeight={600} color="#f6e05e" minW="50px">
                #{i + 1}
              </Text>
              <Box flex={1}>
                <Text fontWeight={600} color="#e8eef8">
                  {s.companyName}
                </Text>
                <Text color="#8b9bb8" fontSize="0.85rem">
                  {s.rating}
                </Text>
              </Box>
              <Text fontWeight={600} color="#4cc9f0" minW="80px" textAlign="right">
                {fmt(s.netWorth)}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </GamePanel>
  );
}
