import { Box, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { PLANET_ICONS, getSeasonMeta, reputationLabel } from '../data/gameData';
import { calcNetWorthFromState, fmt } from '../utils/gameLogic';

function Stat({ label, children, color }) {
  return (
    <Flex direction="column" justify="center" gap={0.5}>
      <Text fontSize="0.68rem" textTransform="uppercase" letterSpacing="0.08em" color="#8b9bb8">
        {label}
      </Text>
      <Text fontFamily="mono" fontWeight={600} fontSize={{ base: '0.88rem', md: '0.95rem' }} color={color || '#e8eef8'}>
        {children}
      </Text>
    </Flex>
  );
}

export default function StatusBar({ state, onRename }) {
  const netWorth = calcNetWorthFromState(state);
  const rep = state.reputation ?? 55;
  const season = state.season;
  const seasonMeta = season ? getSeasonMeta(season) : null;
  const planetIcon = PLANET_ICONS[state.currentPlanet] || '🪐';

  return (
    <Grid
      as="header"
      templateColumns={{ base: '1fr 1fr', md: '1fr 1fr 1fr 1fr', lg: '1.35fr repeat(7, minmax(0, 1fr))' }}
      gap={{ base: '10px', md: 3 }}
      p={{ base: 3, md: '16px 18px' }}
      bg="linear-gradient(180deg, #141e33, #0f1626)"
      border="1px solid"
      borderColor="#243049"
      borderRadius="12px"
      boxShadow="0 8px 28px rgba(0, 0, 0, 0.35)"
    >
      <Flex direction="column" gap={1} gridColumn={{ base: '1 / -1', lg: 'auto' }}>
        <Text as="label" htmlFor="company-name" fontSize="0.68rem" textTransform="uppercase" letterSpacing="0.08em" color="#8b9bb8">
          Company
        </Text>
        <Input
          id="company-name"
          type="text"
          value={state.companyName}
          onChange={(e) => onRename(e.target.value)}
          disabled={state.gameOver}
          maxLength={40}
          aria-label="Company name"
          bg="#070b14"
          border="1px solid"
          borderColor="#243049"
          borderRadius="8px"
          px={2.5}
          py={1.5}
          fontSize="0.9rem"
          minH={{ base: '42px', md: 'auto' }}
          color="#e8eef8"
          _focus={{ borderColor: '#4cc9f0', boxShadow: '0 0 0 1px #4cc9f0' }}
        />
        {state.shipTitle && (
          <Text fontSize="0.72rem" color="#8b9bb8">{state.shipTitle}</Text>
        )}
        {seasonMeta && (
          <Flex
            align="center"
            gap={2}
            mt={1}
            px={2}
            py={1}
            bg="rgba(58, 184, 224, 0.1)"
            border="1px solid"
            borderColor="rgba(58, 184, 224, 0.25)"
            borderRadius="10px"
            title={`${seasonMeta.name}: ${seasonMeta.blurb}`}
          >
            {seasonMeta.image && (
              <Box
                as="img"
                src={seasonMeta.image}
                alt=""
                loading="lazy"
                w="36px"
                h="36px"
                borderRadius="8px"
                objectFit="cover"
                border="1px solid #243049"
                flexShrink={0}
              />
            )}
            <Text fontSize="1rem" lineHeight={1} flexShrink={0} aria-hidden="true">
              {seasonMeta.icon || '🌀'}
            </Text>
            <Flex direction="column" gap={0} minW={0}>
              <Text fontSize="0.6rem" textTransform="uppercase" letterSpacing="0.06em" color="#8b9bb8">
                Season
              </Text>
              <Text fontSize="0.78rem" fontWeight={600} color="#4cc9f0" truncate maxW={{ base: '9rem', md: '11rem' }}>
                {seasonMeta.name}
              </Text>
            </Flex>
          </Flex>
        )}
      </Flex>

      <Stat label="Credits" color="#f6e05e">{fmt(state.credits)}</Stat>
      <Stat label="Debt" color={state.debt > 0 ? '#f07178' : undefined}>{fmt(state.debt || 0)}</Stat>
      <Stat label="Turn">{state.turn} / {state.maxTurns}</Stat>
      <Stat label="Planet" color="#4cc9f0">
        <Text as="span" aria-hidden="true">{planetIcon}</Text> {state.currentPlanet}
      </Stat>
      <Stat label="Fuel">{state.fuel} / {state.maxFuel}</Stat>
      <Stat label="Rep" color="#7dd3a7">
        <Text as="span" title={`Reputation ${rep}/100`}>{reputationLabel(rep)}</Text>
      </Stat>
      <Stat label="Net Worth" color="#b8a9ff">
        <Text as="span" title="Credits + cargo + warehouses - debt">{fmt(netWorth)}</Text>
      </Stat>
    </Grid>
  );
}
