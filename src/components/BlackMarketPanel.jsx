import { useState } from 'react';
import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react';
import { CONTRABAND } from '../data/gameData';
import {
  cargoUsed,
  contrabandInspectionChance,
  fmt,
  isBlackMarketPlanet,
  maxBuyQty,
} from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function BlackMarketPanel({ state, onBuy, onSell }) {
  const [qty, setQty] = useState(1);
  const open = isBlackMarketPlanet(state.currentPlanet);
  const price = state.prices[state.currentPlanet][CONTRABAND];
  const owned = state.cargo[CONTRABAND] || 0;
  const free = state.cargoCapacity - cargoUsed(state.cargo);
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const maxBuy = maxBuyQty(state.credits, free, price);
  const riskPct = Math.round(contrabandInspectionChance(state) * 100);

  if (!open) {
    return (
      <GamePanel
        title="Black Market"
        icon="🕶️"
        badge="Closed"
        badgeMuted
      >
        <Text color="#8b9bb8" fontSize="0.9rem">
          No fence on {state.currentPlanet}. Try{' '}
          <Text as="strong" color="#e8eef8">Outer Rim Depot</Text> or <Text as="strong" color="#e8eef8">Vega Station</Text>.
          {owned > 0 && (
            <>
              {' '}
              You are carrying <Text as="strong" color="#e8eef8">{owned}</Text> Contraband — patrol risk
              ~{riskPct}% next jump.
            </>
          )}
        </Text>
      </GamePanel>
    );
  }

  return (
    <GamePanel
      title="Black Market"
      icon="🕶️"
      badge="Open"
      badgeMuted={false}
    >
      <VStack align="stretch" gap={3}>
        <Text color="#8b9bb8" fontSize="0.9rem">
          Contraband trades hurt reputation. Customs may seize cargo in transit.
        </Text>

        <VStack gap={1} fontSize="0.9rem" color="#e8eef8">
          <Text>
            💰 Price: <Text as="span" fontWeight="600">{fmt(price)}</Text>
          </Text>
          <Text>
            📦 Owned: <Text as="span" fontWeight="600">{owned}</Text>
          </Text>
          <Text>
            ⚠️ Jump risk:{' '}
            <Text
              as="span"
              fontWeight="600"
              color={riskPct > 25 ? '#f07178' : '#e8eef8'}
            >
              {riskPct}%
            </Text>
          </Text>
        </VStack>

        <Flex gap={2} wrap="wrap">
          <Input
            type="number"
            min={1}
            max={99}
            value={qty}
            isDisabled={state.gameOver}
            onChange={(e) => setQty(e.target.value)}
            aria-label="Contraband quantity"
            w="70px"
            bg="#141e33"
            border="1px solid #243049"
            color="#e8eef8"
            _focus={{ borderColor: '#4cc9f0' }}
          />
          <Button
            bg="#2dd4a8"
            color="#070b14"
            _hover={{ bg: '#23b392' }}
            isDisabled={
              state.gameOver ||
              safeQty > maxBuy ||
              maxBuy <= 0
            }
            onClick={() => onBuy(safeQty)}
          >
            ➕ Buy
          </Button>
          <Button
            size="xs"
            bg="#2dd4a8"
            color="#070b14"
            _hover={{ bg: '#23b392' }}
            isDisabled={state.gameOver || maxBuy <= 0}
            onClick={() => onBuy(maxBuy)}
          >
            ⏫ Max
          </Button>
          <Button
            bg="#f0a04b"
            color="#070b14"
            _hover={{ bg: '#dc9442' }}
            isDisabled={state.gameOver || owned < safeQty}
            onClick={() => onSell(safeQty)}
          >
            ➖ Sell
          </Button>
          <Button
            size="xs"
            bg="#f0a04b"
            color="#070b14"
            _hover={{ bg: '#dc9442' }}
            isDisabled={state.gameOver || owned <= 0}
            onClick={() => onSell(owned)}
          >
            ⏬ All
          </Button>
        </Flex>
      </VStack>
    </GamePanel>
  );
}
