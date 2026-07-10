import { Box, Button, Flex, Grid, Text } from '@chakra-ui/react';
import { PLANET_ICONS, PLANETS } from '../data/gameData';
import { fmt, pressureLabel, travelFuelForState } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function TravelPanel({ state, onTravel, onBuyFuel }) {
  const fuelPrice = state.prices[state.currentPlanet]['Fuel Cells'];
  const fuelCost = travelFuelForState(state);
  const canTravel = !state.gameOver && !state.needsHullSelect && state.fuel >= fuelCost;
  const fuelRoom = state.maxFuel - state.fuel;
  const canRefuel = !state.gameOver && !state.needsHullSelect && fuelRoom > 0 && state.credits >= fuelPrice;

  return (
    <GamePanel title="Travel" badge={`Cost: ${fuelCost} fuel · 1 turn`} badgeMuted data-tutorial="travel">
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={2}>
        {PLANETS.map((planet) => {
          const isHere = planet === state.currentPlanet;
          const disabled = isHere || !canTravel;
          const hasDemand = (state.demandEvents || []).some((e) => e.planet === planet);
          const press = Math.round(state.lanePressure?.[planet] ?? 0);
          const isHot = press >= 65;

          return (
            <Flex
              key={planet}
              as="button"
              type="button"
              direction="column"
              gap={1}
              textAlign="left"
              px={3}
              py={2.5}
              minH="44px"
              fontSize="0.88rem"
              border="1px solid"
              borderColor={isHere ? 'rgba(76, 201, 240, 0.45)' : hasDemand ? 'rgba(240, 160, 75, 0.45)' : isHot ? 'rgba(240, 113, 120, 0.45)' : '#243049'}
              bg={isHere ? 'rgba(76, 201, 240, 0.08)' : '#141e33'}
              color={isHere ? '#4cc9f0' : isHot ? '#f0a0a4' : '#e8eef8'}
              borderRadius="8px"
              cursor={disabled ? 'not-allowed' : 'pointer'}
              opacity={disabled && !isHere ? 0.4 : 1}
              transition="all 0.15s"
              _hover={!disabled ? { borderColor: '#2e4a7a', bg: '#1a2740' } : {}}
              _active={!disabled ? { transform: 'translateY(1px)' } : {}}
              onClick={() => !disabled && onTravel(planet)}
              disabled={disabled}
              title={isHere ? 'You are here' : !canTravel ? `Need ${fuelCost} fuel to travel` : `Travel to ${planet} · pressure ${press} (${pressureLabel(press)})`}
            >
              <Flex align="center" gap={1.5}>
                <Text aria-hidden="true">{PLANET_ICONS[planet] || '🪐'}</Text>
                <Text as="strong" fontWeight={600} truncate minW={0}>{planet}</Text>
              </Flex>
              <Text color="#8b9bb8" fontSize="0.72rem" lineHeight="1.25">
                {isHere ? 'Docked here' : `${pressureLabel(press)} pressure`}
                {hasDemand && !isHere ? ' · demand event' : ''}
                {!isHere && isHot ? ' · pirate risk' : ''}
              </Text>
            </Flex>
          );
        })}
      </Grid>

      <Flex
        mt={3.5}
        pt={3.5}
        borderTop="1px solid"
        borderColor="#243049"
        flexWrap="wrap"
        align="center"
        justify="space-between"
        gap={3}
      >
        <Flex direction="column" gap={0.5} fontSize="0.85rem" color="#8b9bb8" fontFamily="mono">
          <Text>Fuel Cells: {fmt(fuelPrice)} cr/unit</Text>
          <Text>Tank: {state.fuel}/{state.maxFuel}</Text>
        </Flex>
        <Flex gap={2}>
          <Button
            size="sm"
            bg="rgba(76, 201, 240, 0.1)"
            border="1px solid"
            borderColor="rgba(76, 201, 240, 0.3)"
            color="#4cc9f0"
            borderRadius="8px"
            minH="44px"
            disabled={!canRefuel}
            onClick={() => onBuyFuel(10)}
            _hover={{ bg: 'rgba(76, 201, 240, 0.2)' }}
            _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
          >
            +10 Fuel
          </Button>
          <Button
            size="sm"
            bg="rgba(76, 201, 240, 0.1)"
            border="1px solid"
            borderColor="rgba(76, 201, 240, 0.3)"
            color="#4cc9f0"
            borderRadius="8px"
            minH="44px"
            disabled={!canRefuel}
            onClick={() => onBuyFuel(fuelRoom)}
            _hover={{ bg: 'rgba(76, 201, 240, 0.2)' }}
            _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
          >
            Fill Tank
          </Button>
        </Flex>
      </Flex>
    </GamePanel>
  );
}
