import { useState } from 'react';
import { Box, Button, Input, Text, VStack, HStack } from '@chakra-ui/react';
import { fmt, listSaveSlots } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function SaveSlotsPanel({ onSaveSlot, onLoadSlot, onDeleteSlot }) {
  const [slots, setSlots] = useState(() => listSaveSlots());
  const [label, setLabel] = useState('');

  function refresh() {
    setSlots(listSaveSlots());
  }

  return (
    <GamePanel
      title="Save Slots"
      icon="💾"
      badge="A–F"
      badgeMuted
    >
      <Text color="#8b9bb8" mb={4} fontSize="0.9rem">
        Named slots keep separate campaigns without overwriting each other.
      </Text>

      <Input
        type="text"
        placeholder="Optional label"
        maxLength={24}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        bg="#141e33"
        border="1px solid #243049"
        color="#e8eef8"
        _placeholder={{ color: '#8b9bb8' }}
        mb={4}
        fontSize="0.9rem"
      />

      <VStack gap={3} align="stretch">
        {slots.map((s) => (
          <Box
            key={s.id}
            pb={3}
            borderBottom="1px solid #243049"
            _last={{ borderBottom: 'none', pb: 0 }}
          >
            <Box mb={3}>
              <Text fontWeight={600} color="#e8eef8" mb={1}>
                {s.id}: {s.empty ? 'Empty' : s.label}
              </Text>
              <Text color="#8b9bb8" fontSize="0.85rem">
                {!s.empty && s.meta ? (
                  <>
                    {s.meta.companyName} · T{s.meta.turn} · {fmt(s.meta.credits)}{' '}
                    cr · {s.meta.planet}
                    {s.meta.runMode === 'daily' ? ' · Daily' : ''}
                  </>
                ) : (
                  'No save'
                )}
              </Text>
            </Box>
            <HStack gap={2} justify="flex-end">
              <Button
                size="xs"
                bg="#f6e05e"
                color="#070b14"
                _hover={{ bg: '#e6d04a' }}
                onClick={() => {
                  const r = onSaveSlot(s.id, label || `Slot ${s.id}`);
                  refresh();
                  return r;
                }}
              >
                💾 Save
              </Button>
              <Button
                size="xs"
                bg="#4cc9f0"
                color="#070b14"
                _hover={{ bg: '#3ab8dd' }}
                disabled={s.empty}
                opacity={s.empty ? 0.5 : 1}
                cursor={s.empty ? 'not-allowed' : 'pointer'}
                onClick={() => {
                  onLoadSlot(s.id);
                  refresh();
                }}
              >
                📂 Load
              </Button>
              <Button
                size="xs"
                bg="#243049"
                color="#e8eef8"
                _hover={{ bg: '#2f3f5a' }}
                disabled={s.empty}
                opacity={s.empty ? 0.5 : 1}
                cursor={s.empty ? 'not-allowed' : 'pointer'}
                onClick={() => {
                  onDeleteSlot(s.id);
                  refresh();
                }}
              >
                🗑️ Clear
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </GamePanel>
  );
}
