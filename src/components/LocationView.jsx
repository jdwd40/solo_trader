import { Box, Flex, Text } from '@chakra-ui/react';
import { LOCATION_IMAGES, PLANET_ICONS } from '../data/gameData';
import GamePanel from './GamePanel';

export default function LocationView({ planet }) {
  const loc = LOCATION_IMAGES[planet] || { src: '/locations/earthport.jpg', blurb: 'Unknown berth.' };
  const icon = PLANET_ICONS[planet] || '🪐';

  return (
    <GamePanel title="Dock view" badge={planet} icon={icon} pb={3}>
      <Box
        pos="relative"
        borderRadius="12px"
        overflow="hidden"
        border="1px solid"
        borderColor="#243049"
        bg="#05080f"
        aspectRatio="16/9"
        maxH={{ base: 'min(36vh, 280px)', md: 'min(38vh, 420px)', xl: '440px' }}
      >
        <Box
          as="img"
          key={planet}
          src={loc.src}
          alt={`View of ${planet}`}
          loading="lazy"
          decoding="async"
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center"
          css={{
            animation: 'locationFade 0.45s ease',
            '@keyframes locationFade': {
              from: { opacity: 0.35, transform: 'scale(1.03)' },
              to: { opacity: 1, transform: 'scale(1)' },
            },
          }}
        />
        <Flex
          pos="absolute"
          left={0}
          right={0}
          bottom={0}
          direction="column"
          gap={0.5}
          px={3.5}
          pb={3}
          pt={6}
          bg="linear-gradient(180deg, transparent 0%, rgba(4,8,16,0.55) 35%, rgba(4,8,16,0.88) 100%)"
        >
          <Text as="strong" fontSize="0.98rem" letterSpacing="0.02em">{planet}</Text>
          <Text fontSize="0.82rem" color="#8b9bb8" lineHeight="1.35">{loc.blurb}</Text>
        </Flex>
      </Box>
    </GamePanel>
  );
}
