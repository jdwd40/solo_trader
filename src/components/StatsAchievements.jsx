import { Box, Grid, Text, VStack, HStack } from '@chakra-ui/react';
import { ACHIEVEMENTS } from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function StatsAchievements({ state }) {
  const stats = state.stats || {};
  const unlocked = new Set(state.achievements || []);

  return (
    <GamePanel
      title="Stats & Badges"
      icon="🏅"
      badge={state.shipTitle || 'Rookie Hauler'}
    >
      <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={3} mb={6}>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            🚀 Jumps
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {stats.jumps || 0}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            💵 Best sale
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {fmt(stats.bestSale || 0)}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            💎 Peak NW
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {fmt(stats.maxNetWorth || 0)}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            🕶️ Smuggled
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {stats.contrabandSmuggled || 0}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            🛡️ Claims
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {stats.insuranceClaims || 0}
          </Text>
        </Box>
        <Box>
          <Text color="#8b9bb8" fontSize="0.8rem" mb={1}>
            🛒 Bought / sold
          </Text>
          <Text fontWeight={600} color="#e8eef8" fontSize="1.1rem">
            {stats.unitsBought || 0} / {stats.unitsSold || 0}
          </Text>
        </Box>
      </Grid>

      <VStack gap={2} align="stretch">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          return (
            <HStack
              key={a.id}
              gap={3}
              pb={2}
              borderBottom="1px solid #243049"
              _last={{ borderBottom: 'none', pb: 0 }}
              opacity={done ? 1 : 0.6}
            >
              <Box fontSize="1.5rem" minW="24px">
                {done ? '🏅' : '🔒'}
              </Box>
              <Box flex={1}>
                <Text fontWeight={600} color="#e8eef8">
                  {a.name}
                </Text>
                <Text color="#8b9bb8" fontSize="0.85rem">
                  {a.desc}
                </Text>
              </Box>
            </HStack>
          );
        })}
      </VStack>
    </GamePanel>
  );
}
