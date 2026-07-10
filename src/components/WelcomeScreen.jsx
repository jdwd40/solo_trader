import { Box, VStack, HStack, Grid, Text, Heading, Button } from '@chakra-ui/react';
import { WELCOME_KEY } from '../data/gameData';

export function isWelcomeSeen() {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearWelcomeSeen() {
  try {
    localStorage.removeItem(WELCOME_KEY);
  } catch {
    /* ignore */
  }
}

export default function WelcomeScreen({ onContinue, onOpenWiki }) {
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={60}
      display="grid"
      placeItems="center"
      p={{ base: 4, md: 5 }}
      bg="rgba(4, 8, 16, 0.88)"
      backdropFilter="blur(8px)"
      overflowY="auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <Box
        w="min(920px, 100%)"
        bg="linear-gradient(165deg, #152038 0%, #0d1424 55%, #0a101c 100%)"
        border="1px solid"
        borderColor="#2e4a7a"
        borderRadius="18px"
        p={{ base: '1.5rem', md: '1.75rem 1.6rem 1.5rem' }}
        boxShadow="0 24px 70px rgba(0, 0, 0, 0.55)"
      >
        <VStack gap={5} align="stretch">
          <Box textAlign="left">
            <Text fontSize="0.75rem" textTransform="uppercase" letterSpacing="0.14em" color="#4cc9f0" m={0}>
              Sector 7 - Solo Operations
            </Text>
            <Heading
              as="h1"
              id="welcome-title"
              fontSize={{ base: '1.75rem', md: '2.35rem' }}
              fontWeight={800}
              mt={1.5}
              mb={2}
              bg="linear-gradient(90deg, #4cc9f0, #3ab8e0)"
              bgClip="text"
              color="transparent"
            >
              Star Trader Solo
            </Heading>
            <Text color="#8b9bb8" fontSize="1.05rem" lineHeight="1.55" maxW="46rem" m={0}>
              You command one trading company. Jump between six starports, buy low,
              sell high, and build the highest net worth you can before turn 100.
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
            {[
              { title: 'Your goal', content: 'Net worth = credits + cargo (and warehouses/stocks) - debt. Finish turn 100 with the best score and epilogue you can.' },
              { title: 'The loop', list: ['Check prices and sparklines at your port.', 'Buy goods if you have credits and cargo space.', 'Jump to another planet (-fuel, +1 turn).', 'Sell where prices are higher. Refuel and repeat.'] },
              { title: 'Going deeper', list: ['Contracts, stocks, loans, and futures for leverage', 'Crew specialists and ship upgrades', 'Seasons, demand spikes, and rival freighters', 'Daily seeded runs and prestige unlocks'] },
              { title: 'Before you launch', content: 'Next you will pick a difficulty and a hull. Need help mid-flight? Open the Wiki anytime from the header.' },
            ].map((block) => (
              <Box key={block.title} p={{ base: 3.5, md: 4 }} bg="rgba(7, 11, 20, 0.55)" border="1px solid" borderColor="#243049" borderRadius="12px">
                <Text fontSize="0.95rem" color="#4cc9f0" fontWeight={600} letterSpacing="0.02em" mb={2}>{block.title}</Text>
                {block.content ? (
                  <Text fontSize="0.9rem" color="#8b9bb8" lineHeight="1.5" m={0}>{block.content}</Text>
                ) : (
                  <Box as="ol" pl={5} m={0} color="#8b9bb8" fontSize="0.9rem" lineHeight="1.5" css={{ 'li + li': { marginTop: '4px' } }}>
                    {block.list.map((item) => <Box as="li" key={item}>{item}</Box>)}
                  </Box>
                )}
              </Box>
            ))}
          </Grid>

          <HStack gap={3} justify="flex-end" flexWrap="wrap">
            <Button
              bg="#070b14"
              border="1px solid"
              borderColor="#243049"
              color="#e8eef8"
              borderRadius="8px"
              px={4}
              py={2}
              _hover={{ borderColor: '#2e4a7a', bg: '#1a2740' }}
              onClick={onOpenWiki}
            >
              Read the wiki
            </Button>
            <Button
              bg="linear-gradient(135deg, #4cc9f0, #3ab8e0)"
              border="none"
              color="#061018"
              fontWeight={700}
              borderRadius="8px"
              px={6}
              py={3}
              fontSize="1rem"
              minW="12rem"
              _hover={{ filter: 'brightness(1.08)' }}
              onClick={() => {
                markWelcomeSeen();
                onContinue();
              }}
            >
              Continue to launch bay
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
