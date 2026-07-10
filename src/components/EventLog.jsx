import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import GamePanel from './GamePanel';

export default function EventLog({ events }) {
  return (
    <GamePanel title="Event Log" badge="Last 10" badgeMuted>
      <VStack
        as="ul"
        listStyleType="none"
        m={0}
        p={0}
        gap={2}
        maxH="260px"
        overflowY="auto"
        align="stretch"
        sx={{ scrollbarWidth: 'thin', scrollbarColor: '#243049 transparent' }}
      >
        {events.length === 0 ? (
          <Text as="li" color="#8b9bb8" fontSize="0.85rem">No events yet.</Text>
        ) : (
          events.map((e) => (
            <Flex
              as="li"
              key={e.id}
              gap={2.5}
              px={2.5}
              py={2}
              bg="#070b14"
              borderRadius="8px"
              border="1px solid"
              borderColor="#243049"
              fontSize="0.85rem"
            >
              <Text fontFamily="mono" color="#3ab8e0" fontSize="0.78rem" pt="2px" flexShrink={0}>
                T{e.turn}
              </Text>
              <Text wordBreak="break-word">{e.message}</Text>
            </Flex>
          ))
        )}
      </VStack>
    </GamePanel>
  );
}
