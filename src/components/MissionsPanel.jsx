import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { fmt, getMissionProgress } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function MissionsPanel({ state, onClaim }) {
  if (state.missionsEnabled === false) return null;
  const missions = getMissionProgress(state);
  const open = missions.filter((m) => !m.claimed);

  return (
    <GamePanel
      title="Missions"
      icon="🎯"
      badge={`${missions.filter((m) => m.claimed).length}/${missions.length}`}
      badgeMuted
    >
      <Text color="#8b9bb8" mb={4} fontSize="0.9rem">
        Optional first-run track. Claim cash when objectives complete.
      </Text>
      {open.length === 0 ? (
        <Text color="#8b9bb8">All mission rewards claimed. Fly free.</Text>
      ) : (
        <VStack gap={3} align="stretch">
          {open.map((m) => (
            <Box
              key={m.id}
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              gap={3}
              pb={3}
              borderBottom="1px solid #243049"
              _last={{ borderBottom: 'none', pb: 0 }}
            >
              <Box flex={1}>
                <Text fontWeight={600} color="#e8eef8" mb={1}>
                  {m.done ? '✅ ' : '○ '}
                  {m.title}
                </Text>
                <Text color="#8b9bb8" fontSize="0.85rem" mb={1}>
                  {m.desc}
                </Text>
                <Text color="#2dd4a8" fontSize="0.85rem" fontWeight={500}>
                  +{fmt(m.reward)} cr
                </Text>
              </Box>
              <Button
                size="xs"
                bg="#2dd4a8"
                color="#070b14"
                _hover={{ bg: '#20c497' }}
                disabled={!m.claimable || state.gameOver || state.needsHullSelect}
                onClick={() => onClaim(m.id)}
              >
                🎁 Claim
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </GamePanel>
  );
}
