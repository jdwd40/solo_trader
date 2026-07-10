import { VStack, HStack, Text, Button } from '@chakra-ui/react';
import { LOAN_INTEREST_RATE, LOAN_OPTIONS, MAX_DEBT } from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function LoanPanel({ state, onBorrow, onRepay }) {
  const debt = state.debt || 0;
  const canBorrowBase = !state.gameOver && (state.reputation ?? 55) >= 15;

  return (
    <GamePanel
      title="💳 Loans"
      badge={`${LOAN_INTEREST_RATE * 100}% / jump`}
      badgeMuted
    >
      <VStack gap={4} align="stretch">
        {/* Stats section */}
        <HStack gap={6} justify="space-around">
          <VStack gap={1} align="flex-start">
            <Text color="#8b9bb8" fontSize="sm">📉 Outstanding</Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={debt > 0 ? '#f07178' : '#e8eef8'}
            >
              {fmt(debt)} cr
            </Text>
          </VStack>
          <VStack gap={1} align="flex-start">
            <Text color="#8b9bb8" fontSize="sm">🏦 Credit limit</Text>
            <Text fontSize="lg" fontWeight="bold" color="#e8eef8">
              {fmt(MAX_DEBT)} cr
            </Text>
          </VStack>
        </HStack>

        {/* Borrow actions */}
        <HStack gap={2} wrap="wrap">
          {LOAN_OPTIONS.map((amt) => {
            const disabled =
              !canBorrowBase || debt + amt > MAX_DEBT;
            return (
              <Button
                key={amt}
                size="sm"
                isDisabled={disabled}
                onClick={() => onBorrow(amt)}
                title={
                  disabled
                    ? 'Cannot borrow (limit or reputation)'
                    : `Borrow ${fmt(amt)}`
                }
                bg="#243049"
                color="#e8eef8"
                _hover={{ bg: '#2e4a7a' }}
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                💵 +{fmt(amt)}
              </Button>
            );
          })}
        </HStack>

        {/* Repay actions */}
        <HStack gap={2}>
          <Button
            size="sm"
            isDisabled={state.gameOver || debt <= 0 || state.credits <= 0}
            onClick={() => onRepay(Math.min(1000, debt, state.credits))}
            bg="#8b9bb8"
            color="#070b14"
            _hover={{ bg: '#a8bcd4' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            flex={1}
          >
            ↩️ Repay 1k
          </Button>
          <Button
            size="sm"
            isDisabled={state.gameOver || debt <= 0 || state.credits <= 0}
            onClick={() => onRepay('all')}
            bg="#8b9bb8"
            color="#070b14"
            _hover={{ bg: '#a8bcd4' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            flex={1}
          >
            ✅ Repay All
          </Button>
        </HStack>
      </VStack>
    </GamePanel>
  );
}
