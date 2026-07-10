import { Box, Flex, Text } from '@chakra-ui/react';
import { COMMODITY_ICONS, getSeasonMeta } from '../data/gameData';

export default function SeasonBanner({ season }) {
  if (!season) return null;

  const meta = getSeasonMeta(season);
  const icon = season.icon || meta.icon || '🌀';
  const image = season.image || meta.image;

  return (
    <Flex
      role="status"
      flexWrap="wrap"
      align={{ base: 'flex-start', md: 'center' }}
      justify="space-between"
      gap={{ base: '12px 20px' }}
      mt={3}
      px={3.5}
      py={3}
      bg="linear-gradient(90deg, rgba(58, 184, 224, 0.1), rgba(76, 201, 240, 0.06))"
      border="1px solid"
      borderColor="rgba(58, 184, 224, 0.25)"
      borderRadius="12px"
    >
      {image && (
        <Box
          flexShrink={0}
          w={{ base: '56px', md: '64px' }}
          h={{ base: '56px', md: '64px' }}
          borderRadius="12px"
          overflow="hidden"
          border="1px solid rgba(58, 184, 224, 0.35)"
          boxShadow="0 4px 14px rgba(0, 0, 0, 0.35)"
          bg="#05080f"
        >
          <Box
            as="img"
            src={image}
            alt=""
            loading="lazy"
            key={season.id || meta.id}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        </Box>
      )}

      <Box flex={1} minW="10rem">
        <Text fontSize="0.68rem" textTransform="uppercase" letterSpacing="0.1em" color="#3ab8e0">
          Sector season
        </Text>
        <Flex align="center" gap={1.5} fontSize="1.05rem" mt={0.5}>
          <Text fontSize="1.15rem" lineHeight={1} aria-hidden="true">{icon}</Text>
          <Text as="strong" fontWeight={700}>{season.name}</Text>
        </Flex>
        <Text fontSize="0.85rem" color="#8b9bb8">{season.blurb}</Text>
      </Box>

      <Box textAlign={{ base: 'left', md: 'right' }} w={{ base: '100%', md: 'auto' }}>
        <Text fontSize="0.82rem" color="#8b9bb8">
          {season.turnsLeftInSeason} jump{season.turnsLeftInSeason === 1 ? '' : 's'} left
        </Text>
        <Flex
          as="ul"
          listStyleType="none"
          m="6px 0 0"
          p={0}
          flexWrap="wrap"
          gap={1}
          justify={{ base: 'flex-start', md: 'flex-end' }}
        >
          {Object.entries(season.mods || {}).map(([c, f]) => (
            <Box
              as="li"
              key={c}
              fontFamily="mono"
              fontSize="0.72rem"
              px={2}
              py="2px"
              borderRadius="full"
              border="1px solid"
              borderColor={f >= 1 ? 'rgba(240, 113, 120, 0.35)' : 'rgba(45, 212, 168, 0.3)'}
              bg="#070b14"
              color={f >= 1 ? '#f07178' : '#2dd4a8'}
            >
              <Text as="span" aria-hidden="true">{COMMODITY_ICONS[c] || '📦'}</Text>{' '}
              {c} x{f}
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
