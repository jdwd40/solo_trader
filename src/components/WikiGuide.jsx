import { useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Button } from '@chakra-ui/react';

const SECTIONS = [
  {
    id: 'basics',
    title: 'Basics',
    body: [
      'You have 100 turns to maximise net worth.',
      'Net worth = credits + ship cargo value + warehouse stock + stocks - debt.',
      'Every jump costs fuel (hull-dependent, usually 8-10) and advances the turn by 1.',
      'Prices refresh every jump (-20% to +25%, floor 10 credits).',
    ],
  },
  {
    id: 'trading',
    title: 'Trading',
    body: [
      'Buy only with enough credits and free cargo space.',
      'Sell only goods you own. Use Max / All for speed.',
      'Sparklines show recent local price history.',
      'Market Intel (paid) compares other planets until your next jump.',
      'Auto-trade rules can buy-if-cheap / sell-if-dear on arrival.',
    ],
  },
  {
    id: 'travel',
    title: 'Travel & fuel',
    body: [
      'Travel panel lists all six ports. Current planet is disabled.',
      'Low fuel blocks jumps - buy Fuel Cells or use Fill Tank.',
      'Navigator crew reduces jump fuel cost (minimum 6).',
      'Fuel Tanker hull has huge tanks and cheaper jumps.',
    ],
  },
  {
    id: 'events',
    title: 'Seasons & risk',
    body: [
      'Seasons last ~10 jumps and shift whole commodity classes.',
      'Demand events create shortages (prices up) or surpluses (down).',
      'Pirate pressure rises on hot lanes - more tolls and higher insurance.',
      'Travel events: pirates, spoilage, fuel leaks, rumours, bonus contracts.',
      'Contraband only at Outer Rim & Vega - customs risk scales with cargo and reputation.',
    ],
  },
  {
    id: 'systems',
    title: 'Systems',
    body: [
      'Loans: borrow cash; interest every jump. Repay to restore reputation.',
      'Futures: pay a fee to lock a sale price; settle by delivering cargo.',
      'Stocks: bid/ask book. Buy = take the ask. Sell = hit the bid. Spread is the cost of immediacy.',
      'Make a 2-way market to post both sides; other traders fill you on jumps (earn spread, risk inventory).',
      'Warehouses: unlock storage on a planet; small upkeep while used.',
      'Insurance: covers spoilage, fuel leaks, and/or customs; premiums scale with heat.',
    ],
  },
  {
    id: 'crew-ship',
    title: 'Crew & hulls',
    body: [
      'Bulk Freighter: extra cargo. Shadow Runner: smuggling edge. Fuel Tanker: range.',
      'Navigator: -1 fuel/jump. Broker: +8% legal sales. Gunner: halves pirate losses.',
      'Crew take wages every jump. Fire them anytime from the Crew panel.',
      'Ship upgrades permanently expand hold or tanks.',
    ],
  },
  {
    id: 'modes',
    title: 'Modes & meta',
    body: [
      'Classic: free RNG each run. Daily: shared seed for the UTC day.',
      'Difficulty (Easy / Normal / Hard) locks at launch.',
      'Save slots A-F plus quick-save. Export/import JSON between browsers.',
      'Finish a run for prestige points and New Game+ permanent bonuses.',
      'Replay codes (STS1...) let friends verify a score checksum offline.',
    ],
  },
  {
    id: 'tips',
    title: 'Quick tips',
    body: [
      'Early game: Food/Ore routes, keep fuel above 20, avoid big debt.',
      'Mid game: ride seasons and shortages; contracts pad cash and rep.',
      'Late game: warehouses + stocks park wealth; watch turn 100.',
      'Keyboard: 1-6 jump, F fill fuel, I intel, S save, L load, ? accessibility.',
    ],
  },
];

export default function WikiGuide({ open, onClose }) {
  const [section, setSection] = useState(SECTIONS[0].id);
  if (!open) return null;

  const current = SECTIONS.find((s) => s.id === section) || SECTIONS[0];

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex={50}
      bg="rgba(7, 11, 20, 0.8)"
      backdropFilter="blur(6px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wiki-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Box
        bg="#0f1626"
        borderRadius="12px"
        maxW="960px"
        maxH="90vh"
        overflowY="auto"
        border="1px solid #243049"
        w="100%"
        mx={4}
        boxShadow="0 24px 70px rgba(0, 0, 0, 0.55)"
      >
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="1px solid #243049"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={4}
        >
          <Heading as="h2" id="wiki-title" fontSize={{ base: 'xl', md: '2xl' }} color="#e8eef8">
            Captain's Wiki
          </Heading>
          <Button
            size="sm"
            bg="#243049"
            color="#e8eef8"
            border="1px solid"
            borderColor="#2e4a7a"
            borderRadius="8px"
            _hover={{ bg: '#2e4a7a' }}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>

        {/* Mobile section selector */}
        <Box display={{ base: 'block', md: 'none' }} p={3} borderBottom="1px solid #243049">
          <Box
            as="select"
            w="100%"
            bg="#070b14"
            color="#e8eef8"
            border="1px solid"
            borderColor="#243049"
            borderRadius="8px"
            px={3}
            py={2}
            fontSize="0.95rem"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </Box>
        </Box>

        <HStack align="stretch" gap={0} minH={{ md: '400px' }}>
          {/* Desktop sidebar nav */}
          <Box
            display={{ base: 'none', md: 'flex' }}
            w="200px"
            flexShrink={0}
            borderRight="1px solid #243049"
            overflowY="auto"
            p={3}
            flexDirection="column"
            gap={1}
            aria-label="Wiki sections"
          >
            {SECTIONS.map((s) => (
              <Button
                key={s.id}
                w="100%"
                textAlign="left"
                justifyContent="flex-start"
                bg={section === s.id ? '#2e4a7a' : 'transparent'}
                color="#e8eef8"
                borderRadius="8px"
                fontSize="0.9rem"
                px={3}
                py={2}
                fontWeight={section === s.id ? 600 : 400}
                _hover={{ bg: section === s.id ? '#2e4a7a' : '#1a2942' }}
                onClick={() => setSection(s.id)}
              >
                {s.title}
              </Button>
            ))}
          </Box>

          {/* Content */}
          <Box p={{ base: 4, md: 6 }} overflowY="auto" flex="1">
            <Heading as="h3" fontSize={{ base: '1.2rem', md: '1.4rem' }} color="#4cc9f0" mb={4}>
              {current.title}
            </Heading>
            <VStack as="ul" align="stretch" gap={3} pl={5}>
              {current.body.map((line) => (
                <Text key={line} color="#c8d4e8" fontSize="0.92rem" as="li" lineHeight="1.6">
                  {line}
                </Text>
              ))}
            </VStack>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}
