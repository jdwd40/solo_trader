import { useState } from 'react';
import { Box, Button, Checkbox, Flex, Input, Select, Text, VStack } from '@chakra-ui/react';
import { LEGAL_COMMODITIES, PLANETS } from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

function newRule() {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    enabled: true,
    action: 'buy',
    commodity: 'Food',
    planet: '',
    maxPrice: 50,
    minPrice: 80,
  };
}

export default function AutoTradePanel({
  state,
  onSaveRules,
  onToggleArrive,
  onRunNow,
}) {
  const [rules, setRules] = useState(() => state.autoTradeRules || []);

  function update(id, patch) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function add() {
    setRules((prev) => [...prev, newRule()].slice(0, 8));
  }

  function remove(id) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function save() {
    onSaveRules(rules);
  }

  return (
    <GamePanel
      title="Auto-trade"
      icon="🤖"
      badge="Macros"
      badgeMuted
    >
      <VStack align="stretch" gap={3}>
        <Text color="#8b9bb8" fontSize="0.9rem">
          Simple if/then rules (not full AI). Run on arrival or manually.
        </Text>

        <Flex align="center" gap={2}>
          <Checkbox
            isChecked={state.autoTradeOnArrive !== false}
            onChange={(e) => onToggleArrive(e.target.checked)}
            colorScheme="cyan"
            _checked={{
              bg: '#4cc9f0',
              borderColor: '#4cc9f0',
            }}
          />
          <Text color="#e8eef8" fontSize="0.9rem">
            Run on planet arrival
          </Text>
        </Flex>

        <VStack gap={2} align="stretch">
          {rules.map((r) => (
            <Flex
              key={r.id}
              gap={2}
              p={2}
              bg="#0f1626"
              border="1px solid #243049"
              borderRadius="6px"
              align="flex-end"
              wrap="wrap"
            >
              <Checkbox
                isChecked={r.enabled}
                onChange={(e) => update(r.id, { enabled: e.target.checked })}
                colorScheme="cyan"
                _checked={{
                  bg: '#4cc9f0',
                  borderColor: '#4cc9f0',
                }}
              />
              <Select
                value={r.action}
                onChange={(e) => update(r.id, { action: e.target.value })}
                size="sm"
                minW="120px"
                bg="#141e33"
                border="1px solid #243049"
                color="#e8eef8"
                _focus={{ borderColor: '#4cc9f0' }}
              >
                <option value="buy">Buy if ≤</option>
                <option value="sell">Sell if ≥</option>
              </Select>
              <Select
                value={r.commodity}
                onChange={(e) => update(r.id, { commodity: e.target.value })}
                size="sm"
                minW="120px"
                bg="#141e33"
                border="1px solid #243049"
                color="#e8eef8"
                _focus={{ borderColor: '#4cc9f0' }}
              >
                {LEGAL_COMMODITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select
                value={r.planet || ''}
                onChange={(e) => update(r.id, { planet: e.target.value })}
                size="sm"
                minW="120px"
                bg="#141e33"
                border="1px solid #243049"
                color="#e8eef8"
                _focus={{ borderColor: '#4cc9f0' }}
                title="Blank = any planet"
              >
                <option value="">Any planet</option>
                {PLANETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              {r.action === 'buy' ? (
                <Input
                  type="number"
                  min={1}
                  value={r.maxPrice}
                  onChange={(e) =>
                    update(r.id, {
                      maxPrice: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                    })
                  }
                  size="sm"
                  w="70px"
                  bg="#141e33"
                  border="1px solid #243049"
                  color="#e8eef8"
                  _focus={{ borderColor: '#4cc9f0' }}
                  title="Max unit price"
                />
              ) : (
                <Input
                  type="number"
                  min={1}
                  value={r.minPrice}
                  onChange={(e) =>
                    update(r.id, {
                      minPrice: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                    })
                  }
                  size="sm"
                  w="70px"
                  bg="#141e33"
                  border="1px solid #243049"
                  color="#e8eef8"
                  _focus={{ borderColor: '#4cc9f0' }}
                  title="Min unit price"
                />
              )}
              <Button
                size="xs"
                bg="#2e4a7a"
                color="#e8eef8"
                border="1px solid #243049"
                _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
                onClick={() => remove(r.id)}
                aria-label="Remove auto-trade rule"
              >
                ×
              </Button>
            </Flex>
          ))}
        </VStack>

        <Flex gap={2} wrap="wrap">
          <Button
            bg="#2e4a7a"
            color="#e8eef8"
            border="1px solid #243049"
            _hover={{ bg: '#364a6f', borderColor: '#2e4a7a' }}
            onClick={add}
          >
            ➕ Rule
          </Button>
          <Button
            bg="#4cc9f0"
            color="#070b14"
            _hover={{ bg: '#3db8d8' }}
            onClick={save}
          >
            💾 Save rules
          </Button>
          <Button
            bg="#2dd4a8"
            color="#070b14"
            _hover={{ bg: '#23b392' }}
            isDisabled={state.gameOver || state.needsHullSelect}
            onClick={onRunNow}
          >
            ▶️ Run now
          </Button>
        </Flex>

        <Text color="#8b9bb8" fontSize="0.78rem">
          Buy uses max affordable/cargo. Sell dumps full stack. Example: Food ≤{' '}
          {fmt(50)} at Earthport.
        </Text>
      </VStack>
    </GamePanel>
  );
}
