import { useRef } from 'react';
import { Box, HStack, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { dailySeedKey } from '../utils/rng';

export default function GameControls({
  onNewGame,
  onNewDaily,
  onSave,
  onLoad,
  onExport,
  onImportFile,
  onReplayTutorial,
  onSwitchHull,
  message,
  runMode,
  rngSeed,
}) {
  const fileRef = useRef(null);

  return (
    <Box
      as="section"
      bg="#0f1626"
      border="1px solid #243049"
      borderRadius="6px"
      p="1.5rem"
    >
      <VStack gap="1.5rem" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading as="h2" fontSize="1.25rem" color="#e8eef8">
            🎮 Game
          </Heading>
          <Box
            bg="#243049"
            px="0.75rem"
            py="0.5rem"
            borderRadius="4px"
            fontSize="0.85rem"
            color="#8b9bb8"
          >
            {runMode === 'daily'
              ? `📅 Daily ${rngSeed || dailySeedKey()}`
              : '🎲 Classic'}
          </Box>
        </HStack>

        {/* Controls Grid */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
          gap="0.75rem"
        >
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onNewGame}
            fontSize="0.9rem"
          >
            🎲 New Classic
          </Button>
          <Button
            bg="#f0a04b"
            color="#070b14"
            fontWeight="bold"
            _hover={{ bg: "#e0944f" }}
            onClick={onNewDaily}
            fontSize="0.9rem"
          >
            📅 New Daily
          </Button>
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onSave}
            fontSize="0.9rem"
          >
            💾 Save
          </Button>
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onLoad}
            fontSize="0.9rem"
          >
            📂 Load
          </Button>
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onExport}
            fontSize="0.9rem"
          >
            📤 Export
          </Button>
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={() => fileRef.current?.click()}
            fontSize="0.9rem"
          >
            📥 Import
          </Button>
          <Box
            as="input"
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            display="none"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile?.(file);
              e.target.value = '';
            }}
          />
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onSwitchHull}
            fontSize="0.9rem"
          >
            🛸 Hull
          </Button>
          <Button
            bg="#243049"
            color="#e8eef8"
            _hover={{ bg: "#2e4a7a" }}
            onClick={onReplayTutorial}
            fontSize="0.9rem"
          >
            🎓 Tutorial
          </Button>
        </Box>

        {/* Message */}
        {message ? (
          <Text color="#4cc9f0" fontSize="0.95rem" fontWeight="500">
            {message}
          </Text>
        ) : null}
      </VStack>
    </Box>
  );
}
