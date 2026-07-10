import { VStack, HStack, Text, Button } from '@chakra-ui/react';
import { INSURANCE_PLANS } from '../data/gameData';
import { fmt, scaledInsurancePremium } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function InsurancePanel({ state, onBuy }) {
  const active = state.insurance || [];

  return (
    <GamePanel
      title="🛡️ Insurance"
      badge={`${active.length} active`}
      badgeMuted
    >
      <VStack gap={4} align="stretch">
        {/* Description */}
        <Text color="#8b9bb8" fontSize="sm">
          Premiums scale with sector pirate heat. Claims auto-pay on covered mishaps.
        </Text>

        {/* Active policies */}
        {active.length > 0 && (
          <VStack gap={2} align="stretch">
            <Text fontSize="xs" color="#8b9bb8" fontWeight="bold" textTransform="uppercase">
              Active Policies
            </Text>
            {active.map((p) => (
              <HStack
                key={p.id}
                justify="space-between"
                p={2}
                bg="#141e33"
                borderRadius="4px"
              >
                <Text fontSize="sm" fontWeight="bold" color="#e8eef8">
                  {p.name}
                </Text>
                <Text fontSize="xs" color="#8b9bb8">
                  {p.turnsLeft} jumps left
                </Text>
              </HStack>
            ))}
          </VStack>
        )}

        {/* Available plans */}
        <VStack gap={2} align="stretch">
          {Object.values(INSURANCE_PLANS).map((plan) => {
            const owned = active.find((p) => p.id === plan.id);
            const premium = scaledInsurancePremium(plan.premium, state);
            const canBuy = !state.gameOver && state.credits >= premium;
            return (
              <HStack
                key={plan.id}
                justify="space-between"
                align="flex-start"
                p={3}
                bg="#141e33"
                borderRadius="6px"
                gap={3}
              >
                <VStack gap={1} align="flex-start" flex={1}>
                  <Text fontSize="sm" fontWeight="bold" color="#e8eef8">
                    {plan.name}
                  </Text>
                  <Text fontSize="xs" color="#8b9bb8">
                    {plan.description}
                  </Text>
                  <Text fontSize="xs" color="#8b9bb8" fontFamily="mono">
                    {plan.duration} jumps · {fmt(premium)} cr
                    {premium !== plan.premium ? ' (heat)' : ''}
                    {owned ? ` · renews (${owned.turnsLeft} left)` : ''}
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  isDisabled={!canBuy}
                  onClick={() => onBuy(plan.id)}
                  bg="#4cc9f0"
                  color="#070b14"
                  _hover={{ bg: '#5dd9ff' }}
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                  fontWeight="bold"
                  whiteSpace="nowrap"
                >
                  {owned ? '🔄 Renew' : '🛡️ Buy'}
                </Button>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </GamePanel>
  );
}
