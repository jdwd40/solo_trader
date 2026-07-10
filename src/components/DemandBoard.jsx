import { Box, Text, VStack, VisuallyHidden } from '@chakra-ui/react';
import { PLANETS } from '../data/gameData';
import GamePanel from './GamePanel';

export default function DemandBoard({ demandEvents }) {
  const events = demandEvents || [];

  return (
    <GamePanel
      title="Sector Demand"
      icon="📊"
      badge={`${events.length} active`}
      badgeMuted
    >
      {events.length === 0 ? (
        <Text color="#8b9bb8">
          No shortages or surpluses right now. Keep jumping — news travels fast.
        </Text>
      ) : (
        <VStack gap={3} align="stretch" mb={4}>
          {events.map((ev) => (
            <Box
              key={ev.id}
              pb={3}
              borderBottom="1px solid #243049"
              _last={{ borderBottom: 'none', pb: 0 }}
            >
              <Text
                fontSize="0.8rem"
                fontWeight={600}
                color={ev.type === 'shortage' ? '#2dd4a8' : '#f0a04b'}
                mb={1}
              >
                {ev.type === 'shortage' ? '📈 Shortage' : '📉 Surplus'}
              </Text>
              <Text fontWeight={600} color="#e8eef8" mb={1}>
                {ev.commodity} · {ev.planet}
              </Text>
              <Text color="#8b9bb8" fontSize="0.85rem">
                ×{ev.factor} · {ev.turnsLeft} jump
                {ev.turnsLeft === 1 ? '' : 's'} left
              </Text>
            </Box>
          ))}
        </VStack>
      )}

      <Text color="#8b9bb8" fontSize="0.8rem">
        Hubs: Food@Earthport · Ore@Mars · Tech@Nova · Luxury@Vega · Fuel@Rim
      </Text>
      <VisuallyHidden>Planets: {PLANETS.join(', ')}</VisuallyHidden>
    </GamePanel>
  );
}
