import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { UPGRADES, upgradeCost } from '../data/gameData';
import { fmt } from '../utils/gameLogic';
import GamePanel from './GamePanel';

export default function ShipUpgrades({ state, onBuyUpgrade }) {
  return (
    <GamePanel
      title="Ship Upgrades"
      icon="⚙️"
      badge="Permanent"
      badgeMuted
    >
      <VStack gap={2} align="stretch">
        {Object.keys(UPGRADES).map((key) => {
          const def = UPGRADES[key];
          const level = state.upgrades?.[key] || 0;
          const maxed = level >= def.maxLevel;
          const cost = upgradeCost(key, level);
          const canAfford = !maxed && cost != null && state.credits >= cost;
          const disabled = state.gameOver || maxed || !canAfford;

          let effectHint = '';
          if (key === 'cargo') {
            effectHint = `Hold: ${state.cargoCapacity} units`;
          } else if (key === 'fuel') {
            effectHint = `Tank: ${state.maxFuel} max`;
          }

          return (
            <Flex
              key={key}
              justify="space-between"
              align="flex-start"
              gap={3}
              p={3}
              bg="#0f1626"
              border="1px solid"
              borderColor="#243049"
              borderRadius="8px"
            >
              <VStack align="stretch" flex={1} gap={1}>
                <Text fontWeight="600" color="#e8eef8" fontSize="0.95rem">
                  {def.name}
                </Text>
                <Text color="#8b9bb8" fontSize="0.85rem">
                  {def.description}
                </Text>
                <Text color="#8b9bb8" fontSize="0.8rem">
                  Lv {level}/{def.maxLevel} · {effectHint}
                </Text>
              </VStack>
              <Button
                size="sm"
                bg={maxed ? '#2e4a7a' : '#4cc9f0'}
                color={maxed ? '#e8eef8' : '#070b14'}
                _hover={{ bg: maxed ? '#364a6f' : '#3db8d8' }}
                isDisabled={disabled}
                onClick={() => onBuyUpgrade(key)}
                title={
                  maxed
                    ? 'Max level'
                    : canAfford
                      ? `Upgrade for ${fmt(cost)}`
                      : `Need ${fmt(cost)} credits`
                }
                flexShrink={0}
                whiteSpace="nowrap"
              >
                {maxed ? '✅ Maxed' : `⬆️ ${fmt(cost)} cr`}
              </Button>
            </Flex>
          );
        })}
      </VStack>
    </GamePanel>
  );
}
