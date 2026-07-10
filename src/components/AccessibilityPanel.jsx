import { Box, Checkbox, Input, Text, VStack, HStack } from '@chakra-ui/react';
import GamePanel from './GamePanel';

export default function AccessibilityPanel({ settings, onChange }) {
  return (
    <GamePanel
      title="Accessibility"
      icon="♿"
    >
      <VStack gap={3} align="stretch" mb={6}>
        <HStack gap={3}>
          <Checkbox
            isChecked={Boolean(settings.highContrast)}
            onChange={(e) =>
              onChange({ ...settings, highContrast: e.target.checked })
            }
            colorScheme="cyan"
          />
          <Text color="#e8eef8">🌓 High contrast</Text>
        </HStack>
        <HStack gap={3}>
          <Checkbox
            isChecked={Boolean(settings.reducedMotion)}
            onChange={(e) =>
              onChange({ ...settings, reducedMotion: e.target.checked })
            }
            colorScheme="cyan"
          />
          <Text color="#e8eef8">🐢 Reduced motion</Text>
        </HStack>
        <HStack gap={3}>
          <Checkbox
            isChecked={settings.showShortcuts !== false}
            onChange={(e) =>
              onChange({ ...settings, showShortcuts: e.target.checked })
            }
            colorScheme="cyan"
          />
          <Text color="#e8eef8">⌨️ Show shortcut hints</Text>
        </HStack>
        <HStack gap={3}>
          <Checkbox
            isChecked={settings.soundEnabled !== false}
            onChange={(e) =>
              onChange({ ...settings, soundEnabled: e.target.checked })
            }
            colorScheme="cyan"
          />
          <Text color="#e8eef8">🔊 Sound effects</Text>
        </HStack>
      </VStack>

      {settings.soundEnabled !== false ? (
        <Box mb={6}>
          <HStack gap={3} align="center">
            <Text color="#8b9bb8" fontSize="0.9rem" minW="80px">
              🔉 Volume
            </Text>
            <Input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume ?? 0.35}
              onChange={(e) =>
                onChange({
                  ...settings,
                  soundVolume: Number(e.target.value),
                })
              }
              flex={1}
              height="6px"
              cursor="pointer"
            />
          </HStack>
        </Box>
      ) : null}

      {settings.showShortcuts !== false ? (
        <Box
          bg="rgba(139, 155, 184, 0.05)"
          p={3}
          borderRadius="6px"
          border="1px solid #243049"
        >
          <Text color="#8b9bb8" fontSize="0.85rem" lineHeight={1.6}>
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" mr={1}>1</Box>
            –
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={1} mr={1}>6</Box>
            travel ·
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={2} mr={1}>F</Box>
            fill fuel ·
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={2} mr={1}>I</Box>
            intel ·
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={2} mr={1}>?</Box>
            toggle this panel ·
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={2} mr={1}>S</Box>
            save ·
            <Box as="kbd" bg="rgba(76, 201, 240, 0.1)" px={2} py={1} borderRadius="4px" ml={2} mr={1}>L</Box>
            load
          </Text>
        </Box>
      ) : null}
    </GamePanel>
  );
}
