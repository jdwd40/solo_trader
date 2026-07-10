import { Box, Flex, Grid, Text, VStack } from '@chakra-ui/react';
import { CREW_ROLES, PLANET_ICONS, getHull } from '../data/gameData';
import { cargoUsed, crewWageTotal, fmt, travelFuelForState } from '../utils/gameLogic';
import GamePanel from './GamePanel';

function StatBar({ label, value, max, colorGradient, detail }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const warn = pct <= 20;
  return (
    <Box>
      <Flex justify="space-between" gap={2} fontSize="0.82rem" color="#8b9bb8">
        <Text>{label}</Text>
        <Text as="strong" color="#e8eef8" fontFamily="mono" fontWeight={600} fontSize="0.8rem">
          {detail ?? `${fmt(value)} / ${fmt(max)}`}
        </Text>
      </Flex>
      <Box h="10px" borderRadius="full" bg="#070b14" border="1px solid" borderColor="#243049" overflow="hidden" mt={1} aria-hidden="true">
        <Box
          h="100%"
          borderRadius="full"
          transition="width 0.25s ease"
          bg={warn ? 'linear-gradient(90deg, #c44, #f07178)' : colorGradient}
          w={`${pct}%`}
        />
      </Box>
    </Box>
  );
}

export default function ShipStatus({ state }) {
  const hull = getHull(state.hullId);
  const used = cargoUsed(state.cargo);
  const free = Math.max(0, state.cargoCapacity - used);
  const fuelPct = state.maxFuel ? Math.round((state.fuel / state.maxFuel) * 100) : 0;
  const cargoPct = state.cargoCapacity ? Math.round((used / state.cargoCapacity) * 100) : 0;
  const jumpCost = travelFuelForState(state);
  const jumpsLeft = jumpCost > 0 ? Math.floor(state.fuel / jumpCost) : 0;
  const wages = crewWageTotal(state.crew);
  const planetIcon = PLANET_ICONS[state.currentPlanet] || '🪐';
  const upgrades = state.upgrades || {};
  const noHull = !state.hullId || state.needsHullSelect;

  return (
    <GamePanel title="Ship status" badge={noHull ? 'No hull' : hull.name}>
      <VStack gap={3.5} align="stretch">
        {/* Ship image */}
        <Box pos="relative" borderRadius="12px" overflow="hidden" border="1px solid" borderColor="#243049" bg="#05080f" aspectRatio="16/10" maxH={{ base: '200px', md: 'none' }} minH={{ md: '168px' }}>
          {noHull ? (
            <Flex h="100%" align="center" justify="center" p={4} textAlign="center" color="#8b9bb8" fontSize="0.9rem">
              Select a hull in the launch bay to register your vessel.
            </Flex>
          ) : (
            <Box as="img" key={hull.id} src={hull.image || '/ships/freighter.jpg'} alt={hull.name} loading="lazy" w="100%" h="100%" objectFit="cover" objectPosition="center 40%" />
          )}
          {!noHull && (
            <Flex pos="absolute" left={0} right={0} bottom={0} direction="column" gap={0.5} px={3} pb={2.5} pt={5} bg="linear-gradient(180deg, transparent, rgba(4,8,16,0.88))">
              <Text as="strong" fontSize="0.95rem">{hull.name}</Text>
              <Text fontSize="0.76rem" color="#8b9bb8" lineHeight="1.3" css={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {hull.blurb}
              </Text>
            </Flex>
          )}
        </Box>

        {/* Stat bars */}
        <VStack gap={2.5} align="stretch">
          <StatBar label="Fuel" value={state.fuel} max={state.maxFuel} colorGradient="linear-gradient(90deg, #1e90ff, #4cc9f0)" detail={`${state.fuel} / ${state.maxFuel} · ${fuelPct}%`} />
          <StatBar label="Cargo hold" value={used} max={state.cargoCapacity} colorGradient="linear-gradient(90deg, #3ab8e0, #4cc9f0)" detail={`${used} used · ${free} free · ${cargoPct}%`} />
        </VStack>

        {/* Key stats */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={1.5} as="dl">
          {[
            ['Docked', <><Text as="span" aria-hidden="true">{planetIcon}</Text> {state.currentPlanet}</>],
            ['Jump cost', `${jumpCost} fuel · ~${jumpsLeft} jump${jumpsLeft === 1 ? '' : 's'} left`],
            ['Credits / debt', <><Text as="span" color="#f6e05e">{fmt(state.credits)}</Text>{state.debt > 0 ? <Text as="span" color="#f07178"> · -{fmt(state.debt)}</Text> : ' · clear'}</>],
            ['Upgrades', `Hold Lv ${upgrades.cargo || 0} · Tanks Lv ${upgrades.fuel || 0}`],
            ['Crew wages', wages > 0 ? `${fmt(wages)} cr / jump` : 'None aboard'],
            ['Risk profile', `Pirates x${hull.pirateRiskMod} · Customs x${hull.contrabandRiskMod}`],
          ].map(([label, val]) => (
            <Flex key={label} direction={{ base: 'row', md: 'column' }} justify={{ base: 'space-between', md: 'flex-start' }} align={{ base: 'center', md: 'flex-start' }} gap={1} px={2} py={2} bg="#070b14" borderRadius="8px" border="1px solid" borderColor="#243049" fontSize="0.82rem">
              <Text as="dt" color="#8b9bb8" fontSize={{ md: '0.68rem' }} textTransform={{ md: 'uppercase' }} letterSpacing={{ md: '0.06em' }}>{label}</Text>
              <Text as="dd" m={0} fontFamily="mono" fontSize="0.76rem" textAlign={{ base: 'right', md: 'left' }} overflowWrap="anywhere">{val}</Text>
            </Flex>
          ))}
        </Grid>

        {/* Crew roster */}
        <Box>
          <Text fontSize="0.72rem" textTransform="uppercase" letterSpacing="0.08em" color="#8b9bb8" mb={2}>Crew roster</Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={2} as="ul" listStyleType="none" m={0} p={0}>
            {Object.values(CREW_ROLES).map((role) => {
              const onBoard = Boolean(state.crew?.[role.id]);
              return (
                <Flex
                  as="li"
                  key={role.id}
                  direction="column"
                  align="center"
                  gap={1}
                  p={2}
                  bg="#070b14"
                  border="1px solid"
                  borderColor={onBoard ? 'rgba(45, 212, 168, 0.4)' : '#243049'}
                  borderRadius="10px"
                  fontSize="0.72rem"
                  color={onBoard ? '#e8eef8' : '#8b9bb8'}
                  opacity={onBoard ? 1 : 0.55}
                  title={onBoard ? `${role.name} — ${role.blurb}` : `${role.name} vacant`}
                >
                  <Box
                    as="img"
                    src={role.avatar}
                    alt=""
                    w={{ base: '44px', md: '48px', xl: '54px' }}
                    h={{ base: '44px', md: '48px', xl: '54px' }}
                    borderRadius="50%"
                    objectFit="cover"
                    border="2px solid"
                    borderColor={onBoard ? 'rgba(45, 212, 168, 0.55)' : '#243049'}
                  />
                  <Text textAlign="center" lineHeight="1.2" fontSize="0.68rem">{onBoard ? role.name : '—'}</Text>
                </Flex>
              );
            })}
          </Grid>
          {!Object.values(CREW_ROLES).some((r) => state.crew?.[r.id]) && (
            <Text color="#8b9bb8" fontSize="0.8rem" mt={2}>No specialists hired yet.</Text>
          )}
        </Box>
      </VStack>
    </GamePanel>
  );
}
