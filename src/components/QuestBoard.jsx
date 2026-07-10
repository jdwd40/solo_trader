import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function QuestBoard({
  state,
  onAccept,
  onComplete,
  onAbandon,
}) {
  const board = state.questBoard || [];
  const active = state.quests || [];

  return (
    <GamePanel
      title="Contracts"
      icon="📋"
      badge={`${active.length} active · ${board.length} offered`}
      badgeMuted
    >
      <VStack align="stretch" gap={3}>
        <Text color="#8b9bb8" fontSize="0.9rem">
          Accept delivery jobs. Bring the goods to the destination before time runs out.
        </Text>

        {active.length > 0 && (
          <VStack align="stretch" gap={2}>
            <Text fontWeight="600" color="#e8eef8" fontSize="0.9rem">
              📌 Active
            </Text>
            <VStack gap={2} align="stretch">
              {active.map((q) => {
                const here = state.currentPlanet === q.toPlanet;
                const owned = state.cargo[q.commodity] || 0;
                const canComplete =
                  !state.gameOver && here && owned >= q.qty;
                return (
                  <Box
                    key={q.id}
                    p={3}
                    bg="#141e33"
                    border="1px solid #243049"
                    borderRadius="8px"
                  >
                    <VStack align="stretch" gap={2}>
                      <VStack align="stretch" gap={0.5}>
                        <Text fontWeight="600" color="#e8eef8" fontSize="0.95rem">
                          {q.title}
                        </Text>
                        <Text color="#8b9bb8" fontSize="0.85rem">
                          → {q.toPlanet} · {q.turnsLeft} jumps · reward{' '}
                          {fmt(q.reward)} · have {owned}/{q.qty}
                        </Text>
                      </VStack>
                      <Flex gap={2}>
                        <Button
                          size="xs"
                          bg="#2dd4a8"
                          color="#070b14"
                          _hover={{ bg: '#23b392' }}
                          isDisabled={!canComplete}
                          onClick={() => onComplete(q.id)}
                        >
                          ✅ Deliver
                        </Button>
                        <Button
                          size="xs"
                          bg="#2e4a7a"
                          color="#e8eef8"
                          border="1px solid #243049"
                          _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
                          isDisabled={state.gameOver}
                          onClick={() => onAbandon(q.id)}
                        >
                          ❌ Drop
                        </Button>
                      </Flex>
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        )}

        <Text fontWeight="600" color="#e8eef8" fontSize="0.9rem">
          📋 Board
        </Text>
        {board.length === 0 ? (
          <Text color="#8b9bb8" fontSize="0.9rem">
            No offers. Jump to refresh the board.
          </Text>
        ) : (
          <VStack gap={2} align="stretch">
            {board.map((q) => (
              <Box
                key={q.id}
                p={3}
                bg="#0f1626"
                border="1px solid #243049"
                borderRadius="8px"
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={3}
              >
                <VStack align="stretch" flex={1} gap={0.5}>
                  <Text fontWeight="600" color="#e8eef8" fontSize="0.95rem">
                    {q.title}
                  </Text>
                  <Text color="#8b9bb8" fontSize="0.85rem">
                    → {q.toPlanet} · {q.turnsLeft} jumps · +{fmt(q.reward)} cr · +
                    {q.repReward} rep
                  </Text>
                </VStack>
                <Button
                  size="xs"
                  bg="#4cc9f0"
                  color="#070b14"
                  _hover={{ bg: '#3db8d8' }}
                  isDisabled={state.gameOver || (state.quests || []).length >= 2}
                  onClick={() => onAccept(q.id)}
                  flexShrink={0}
                  whiteSpace="nowrap"
                >
                  ✍️ Accept
                </Button>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </GamePanel>
  );
}
