import { useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Button, Grid } from '@chakra-ui/react';
import {
  DIFFICULTIES,
  HULL_SWITCH_COST,
  SHIP_HULLS,
} from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function HullSelect({
  mode = 'start',
  currentHullId,
  credits,
  difficulty = 'normal',
  onSelect,
  onCancel,
  onDifficulty,
}) {
  const isSwitch = mode === 'switch';
  const [diff, setDiff] = useState(difficulty || 'normal');

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="#070b14"
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hull-title"
    >
      <Box
        bg="#0f1626"
        borderRadius="8px"
        p="2rem"
        maxW="900px"
        maxH="90vh"
        overflowY="auto"
        border="1px solid #243049"
      >
        <VStack gap="1.5rem" align="stretch">
          {/* Header */}
          <VStack gap="0.75rem" align="stretch">
            <Text fontSize="sm" color="#8b9bb8" fontWeight="500">
              {isSwitch ? '🛠️ Shipyard' : '🚀 Launch Bay'}
            </Text>
            <Heading as="h2" id="hull-title" fontSize="2xl" color="#e8eef8">
              {isSwitch ? '🛸 Switch hull class' : '⚙️ Choose difficulty & hull'}
            </Heading>
            <Text color="#e8eef8" fontSize="0.95rem">
              {isSwitch
                ? `Re-registration costs ${fmt(HULL_SWITCH_COST)} cr. Cargo must fit the new hold.`
                : 'Difficulty locks at launch. Hull stats shape cargo, fuel, and risk.'}
            </Text>
          </VStack>

          {/* Difficulty Selection */}
          {!isSwitch ? (
            <HStack gap="1rem" justify="center">
              {Object.values(DIFFICULTIES).map((d) => (
                <Button
                  key={d.id}
                  bg={diff === d.id ? "#2e4a7a" : "#243049"}
                  color="#e8eef8"
                  _hover={{ bg: "#2e4a7a" }}
                  onClick={() => {
                    setDiff(d.id);
                    onDifficulty?.(d.id);
                  }}
                  p="1rem"
                  textAlign="center"
                  minW="150px"
                >
                  <VStack gap="0.25rem">
                    <Text fontWeight="bold">{d.name}</Text>
                    <Text fontSize="0.8rem" color="#8b9bb8">
                      {d.blurb}
                    </Text>
                  </VStack>
                </Button>
              ))}
            </HStack>
          ) : null}

          {/* Hull Grid */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
            {Object.values(SHIP_HULLS).map((h) => {
              const isCurrent = currentHullId === h.id;
              return (
                <Button
                  key={h.id}
                  as={Box}
                  bg={isCurrent ? "#2e4a7a" : "#141e33"}
                  borderColor={isCurrent ? "#2e4a7a" : "#243049"}
                  borderWidth="1px"
                  p="1rem"
                  borderRadius="6px"
                  cursor={isSwitch && isCurrent ? "not-allowed" : "pointer"}
                  opacity={isSwitch && isCurrent ? 0.5 : 1}
                  onClick={() => {
                    if (!isSwitch) onDifficulty?.(diff);
                    onSelect(h.id);
                  }}
                  disabled={isSwitch && isCurrent}
                  display="block"
                  _hover={{
                    borderColor: isSwitch && isCurrent ? "#243049" : "#2e4a7a",
                  }}
                >
                  <VStack gap="0.75rem" align="stretch">
                    {h.image ? (
                      <Box
                        as="img"
                        src={h.image}
                        alt=""
                        loading="lazy"
                        w="100%"
                        h="120px"
                        objectFit="cover"
                        borderRadius="4px"
                      />
                    ) : null}
                    <Heading as="h3" fontSize="1rem" color="#e8eef8" fontWeight="bold">
                      {h.name}
                    </Heading>
                    <Text fontSize="0.85rem" color="#8b9bb8" lineHeight="1.4">
                      {h.blurb}
                    </Text>
                    <Box as="ul" pl="1.25rem" color="#e8eef8" fontSize="0.8rem">
                      <Box as="li">
                        Cargo {h.cargoBonus >= 0 ? '+' : ''}
                        {h.cargoBonus}
                      </Box>
                      <Box as="li">Fuel +{h.fuelBonus}</Box>
                      <Box as="li">Jump {h.travelFuelCost} fuel</Box>
                      <Box as="li">Customs ×{h.contrabandRiskMod}</Box>
                      <Box as="li">Pirates ×{h.pirateRiskMod}</Box>
                    </Box>
                    {isCurrent && (
                      <Box
                        bg="#4cc9f0"
                        color="#070b14"
                        px="0.75rem"
                        py="0.25rem"
                        borderRadius="4px"
                        fontSize="0.75rem"
                        fontWeight="bold"
                        textAlign="center"
                      >
                        Current
                      </Box>
                    )}
                  </VStack>
                </Button>
              );
            })}
          </Grid>

          {/* Cancel Button */}
          {isSwitch && onCancel ? (
            <Button
              bg="#243049"
              color="#e8eef8"
              _hover={{ bg: "#2e4a7a" }}
              onClick={onCancel}
            >
              ✖️ Cancel
            </Button>
          ) : null}

          {/* Info Text */}
          {!isSwitch && credits != null ? (
            <Text color="#8b9bb8" fontSize="0.8rem">
              Starting credits after prestige & difficulty apply on select.
            </Text>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}
