import { useEffect, useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Button } from '@chakra-ui/react';
import { TUTORIAL_KEY } from '../data/gameData';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome, Captain',
    body: 'You run a solo trading company. Goal: highest net worth after 100 turns. Net worth = credits + cargo − debt.',
    target: null,
  },
  {
    id: 'buy',
    title: 'Step 1 — Buy low',
    body: 'Use the Market table. Pick a cheap good (watch sparklines), set qty, and hit Buy. Try Food or Ore to start.',
    target: 'market',
  },
  {
    id: 'travel',
    title: 'Step 2 — Travel',
    body: 'Jump to another planet (costs 10 fuel + 1 turn). Prices reshuffle every jump. Refuel with Fuel Cells when low.',
    target: 'travel',
  },
  {
    id: 'sell',
    title: 'Step 3 — Sell high',
    body: 'Sell where prices are better. Use Market Intel, demand events, and futures to plan routes. Skip this coach anytime.',
    target: 'market',
  },
  {
    id: 'done',
    title: 'You are cleared for launch',
    body: 'Explore loans, upgrades, black markets, and futures when ready. Replay this coach from Game controls.',
    target: null,
  },
];

export function isTutorialDone() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearTutorialDone() {
  try {
    localStorage.removeItem(TUTORIAL_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * First-run coach. `forceOpen` restarts from Game controls.
 */
export default function TutorialCoach({
  state,
  forceOpen,
  onForceConsumed,
}) {
  const [open, setOpen] = useState(() => !isTutorialDone());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      onForceConsumed?.();
    }
  }, [forceOpen, onForceConsumed]);

  // Auto-advance on key actions
  useEffect(() => {
    if (!open) return;
    const legalCargo = Object.entries(state.cargo || {}).some(
      ([k, v]) => k !== 'Contraband' && v > 0
    );
    if (step === 1 && legalCargo) setStep(2);
    if (step === 2 && state.turn > 1) setStep(3);
    if (step === 3 && legalCargo === false && state.turn > 1) {
      // sold everything after travel — soft advance
    }
  }, [state.cargo, state.turn, open, step]);

  if (!open) return null;

  const current = STEPS[step] || STEPS[0];
  const isLast = step >= STEPS.length - 1;

  function finish() {
    markTutorialDone();
    setOpen(false);
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="dialog"
      aria-label="Tutorial"
    >
      {/* Spotlight Overlay */}
      {current.target && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(7, 11, 20, 0.7)"
          pointerEvents="none"
          className={`tutorial-spotlight target-${current.target}`}
        />
      )}

      {/* Tutorial Card */}
      <Box
        bg="#0f1626"
        borderRadius="8px"
        p="2rem"
        maxW="500px"
        border="1px solid #243049"
        position="relative"
        zIndex="10"
      >
        <VStack gap="1.5rem" align="stretch">
          {/* Header */}
          <VStack gap="0.75rem" align="stretch">
            <Text fontSize="sm" color="#8b9bb8" fontWeight="500">
              Coach · {step + 1}/{STEPS.length}
            </Text>
            <Heading as="h3" fontSize="1.5rem" color="#e8eef8">
              {current.title}
            </Heading>
          </VStack>

          {/* Body */}
          <Text color="#e8eef8" fontSize="1rem" lineHeight="1.6">
            {current.body}
          </Text>

          {/* Actions */}
          <HStack gap="1rem" justify="flex-end">
            <Button
              bg="#243049"
              color="#e8eef8"
              _hover={{ bg: "#2e4a7a" }}
              onClick={finish}
            >
              Skip
            </Button>
            <Button
              bg="#4cc9f0"
              color="#070b14"
              fontWeight="bold"
              _hover={{ bg: "#3bb8dd" }}
              onClick={next}
            >
              {isLast ? 'Start trading' : 'Next'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
