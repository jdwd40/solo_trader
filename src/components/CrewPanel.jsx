import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { CREW_ROLES } from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function CrewPanel({ state, onHire, onFire }) {
  const crew = state.crew || {};

  return (
    <GamePanel
      title="Crew"
      icon="👥"
      badge="Wages / jump"
      badgeMuted
    >
      <Text color="#8b9bb8" fontSize="0.9rem" mb={4}>
        Hire specialists for permanent voyage bonuses. Wages auto-deduct each jump.
      </Text>
      <VStack gap={2} align="stretch">
        {Object.values(CREW_ROLES).map((role) => {
          const hired = Boolean(crew[role.id]);
          return (
            <Box
              key={role.id}
              display="flex"
              flexDirection="row"
              gap={3}
              p={3}
              bg={hired ? '#141e33' : '#0f1626'}
              border="1px solid"
              borderColor="#243049"
              borderRadius="8px"
              transition="all 0.2s"
            >
              <Box position="relative" flexShrink={0}>
                <Box
                  as="img"
                  src={role.avatar}
                  alt={`${role.name} portrait`}
                  loading="lazy"
                  w="60px"
                  h="60px"
                  borderRadius="6px"
                  objectFit="cover"
                />
                {hired && (
                  <Text
                    position="absolute"
                    bottom={-1}
                    right={-1}
                    fontSize="0.8rem"
                    bg="#2dd4a8"
                    color="#070b14"
                    px={1.5}
                    py={0.5}
                    borderRadius="4px"
                    fontWeight="600"
                  >
                    ✅ Aboard
                  </Text>
                )}
              </Box>
              <VStack flex={1} align="stretch" gap={1} justify="flex-start">
                <Text fontWeight="600" color="#e8eef8" fontSize="0.95rem">
                  {role.name}
                </Text>
                <Text color="#8b9bb8" fontSize="0.85rem">
                  {role.blurb}
                </Text>
                <Text color="#8b9bb8" fontSize="0.8rem">
                  Hire {fmt(role.hireCost)} · wage {role.wage}
                </Text>
                {hired ? (
                  <Button
                    size="xs"
                    bg="#2e4a7a"
                    color="#e8eef8"
                    border="1px solid #243049"
                    _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
                    isDisabled={state.gameOver}
                    onClick={() => onFire(role.id)}
                    mt={1}
                  >
                    🚪 Fire
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    bg="#2dd4a8"
                    color="#070b14"
                    _hover={{ bg: '#23b392' }}
                    isDisabled={
                      state.gameOver ||
                      state.needsHullSelect ||
                      state.credits < role.hireCost
                    }
                    onClick={() => onHire(role.id)}
                    mt={1}
                  >
                    🤝 Hire
                  </Button>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </GamePanel>
  );
}
