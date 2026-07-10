import { useState } from 'react';
import { Box, Button, Flex, Input, Select, Text, VStack } from '@chakra-ui/react';
import {
  COMMODITIES,
  WAREHOUSE_CAPACITY,
  WAREHOUSE_UNLOCK_COST,
  WAREHOUSE_UPKEEP,
} from '../data/gameData';
import { cargoUsed, fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function WarehousePanel({
  state,
  onUnlock,
  onDeposit,
  onWithdraw,
}) {
  const planet = state.currentPlanet;
  const wh = state.warehouses?.[planet];
  const unlocked = Boolean(wh);
  const [commodity, setCommodity] = useState(COMMODITIES[0]);
  const [qty, setQty] = useState(5);
  const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
  const used = unlocked ? cargoUsed(wh) : 0;
  const shipOwned = state.cargo[commodity] || 0;
  const stored = unlocked ? wh[commodity] || 0 : 0;

  return (
    <GamePanel
      title="Warehouse"
      icon="🏭"
      badge={planet}
      badgeMuted
    >
      {!unlocked ? (
        <VStack align="stretch" gap={3}>
          <Text color="#8b9bb8" fontSize="0.9rem">
            Rent planetary storage (cap {WAREHOUSE_CAPACITY}). Upkeep{' '}
            {WAREHOUSE_UPKEEP} cr/jump while occupied.
          </Text>
          <Button
            bg="#4cc9f0"
            color="#070b14"
            _hover={{ bg: '#3db8d8' }}
            isDisabled={
              state.gameOver || state.credits < WAREHOUSE_UNLOCK_COST
            }
            onClick={onUnlock}
          >
            🔑 Unlock ({fmt(WAREHOUSE_UNLOCK_COST)} cr)
          </Button>
        </VStack>
      ) : (
        <VStack align="stretch" gap={3}>
          <Box
            w="100%"
            h="6px"
            bg="#0f1626"
            border="1px solid #243049"
            borderRadius="3px"
            overflow="hidden"
            aria-hidden="true"
          >
            <Box
              h="100%"
              bg="#4cc9f0"
              transition="width 0.3s"
              w={`${Math.min(100, Math.round((used / WAREHOUSE_CAPACITY) * 100))}%`}
            />
          </Box>
          <Text color="#8b9bb8" fontSize="0.85rem">
            {used} / {WAREHOUSE_CAPACITY} stored
            {used > 0 ? ` · upkeep ${WAREHOUSE_UPKEEP} cr/jump` : ''}
          </Text>

          <Flex gap={2} wrap="wrap" align="flex-end">
            <Select
              value={commodity}
              isDisabled={state.gameOver}
              onChange={(e) => setCommodity(e.target.value)}
              flex={1}
              minW="200px"
              bg="#141e33"
              border="1px solid #243049"
              color="#e8eef8"
              _focus={{ borderColor: '#4cc9f0' }}
            >
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c} (ship {state.cargo[c] || 0} · wh {wh[c] || 0})
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              max={99}
              value={qty}
              isDisabled={state.gameOver}
              onChange={(e) => setQty(e.target.value)}
              w="70px"
              bg="#141e33"
              border="1px solid #243049"
              color="#e8eef8"
              _focus={{ borderColor: '#4cc9f0' }}
            />
            <Button
              size="xs"
              bg="#2dd4a8"
              color="#070b14"
              _hover={{ bg: '#23b392' }}
              isDisabled={state.gameOver || shipOwned < safeQty}
              onClick={() => onDeposit(commodity, safeQty)}
            >
              ⬇️ Deposit
            </Button>
            <Button
              size="xs"
              bg="#f0a04b"
              color="#070b14"
              _hover={{ bg: '#dc9442' }}
              isDisabled={state.gameOver || stored < safeQty}
              onClick={() => onWithdraw(commodity, safeQty)}
            >
              ⬆️ Withdraw
            </Button>
          </Flex>
        </VStack>
      )}
    </GamePanel>
  );
}
