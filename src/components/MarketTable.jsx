import { useState } from 'react';
import { Box, Button, Flex, Grid, Input, Text, VStack } from '@chakra-ui/react';
import { COMMODITY_ICONS, LEGAL_COMMODITIES } from '../data/gameData';
import { cargoUsed, fmt, maxBuyQty } from '../utils/gameLogic';
import Sparkline from './Sparkline';
import GamePanel from './GamePanel';

function defaultQtys() {
  return Object.fromEntries(LEGAL_COMMODITIES.map((c) => [c, 1]));
}

const btnBuy = { bg: 'rgba(45, 212, 168, 0.12)', borderColor: 'rgba(45, 212, 168, 0.35)', color: '#2dd4a8', _hover: { bg: 'rgba(45, 212, 168, 0.22)' }, _disabled: { opacity: 0.4, cursor: 'not-allowed' } };
const btnSell = { bg: 'rgba(240, 160, 75, 0.12)', borderColor: 'rgba(240, 160, 75, 0.35)', color: '#f0a04b', _hover: { bg: 'rgba(240, 160, 75, 0.22)' }, _disabled: { opacity: 0.4, cursor: 'not-allowed' } };

export default function MarketTable({ state, onBuy, onSell }) {
  const [qtys, setQtys] = useState(defaultQtys);
  const prices = state.prices[state.currentPlanet];
  const history = state.priceHistory?.[state.currentPlanet] || {};
  const used = cargoUsed(state.cargo);
  const free = state.cargoCapacity - used;
  const demands = (state.demandEvents || []).filter((e) => e.planet === state.currentPlanet);

  function setQty(commodity, value) {
    const n = Math.max(1, Math.min(999, Math.floor(Number(value) || 1)));
    setQtys((prev) => ({ ...prev, [commodity]: n }));
  }

  function qtyOf(commodity) {
    return Math.max(1, Math.min(999, Math.floor(Number(qtys[commodity]) || 1)));
  }

  function demandTag(commodity) {
    const ev = demands.find((d) => d.commodity === commodity);
    if (!ev) return null;
    return (
      <Text
        as="span"
        fontSize="0.72rem"
        px={2}
        py="1px"
        borderRadius="full"
        fontWeight={600}
        bg={ev.type === 'shortage' ? 'rgba(240, 113, 120, 0.15)' : 'rgba(45, 212, 168, 0.12)'}
        color={ev.type === 'shortage' ? '#f0a0a4' : '#2dd4a8'}
        border="1px solid"
        borderColor={ev.type === 'shortage' ? 'rgba(240, 113, 120, 0.35)' : 'rgba(45, 212, 168, 0.3)'}
        title={`${ev.type} · ${ev.turnsLeft} turns left · x${ev.factor}`}
        ml={1}
      >
        {ev.type === 'shortage' ? '↑' : '↓'}
      </Text>
    );
  }

  return (
    <GamePanel title="Market" badge={state.currentPlanet} badgeMuted data-tutorial="market">
      {demands.length > 0 && (
        <Flex flexWrap="wrap" gap={1.5} mb={3}>
          {demands.map((d) => (
            <Text
              key={d.id}
              fontSize="0.75rem"
              px={2}
              py="3px"
              borderRadius="full"
              fontWeight={600}
              bg={d.type === 'shortage' ? 'rgba(240, 113, 120, 0.15)' : 'rgba(45, 212, 168, 0.12)'}
              color={d.type === 'shortage' ? '#f0a0a4' : '#2dd4a8'}
              border="1px solid"
              borderColor={d.type === 'shortage' ? 'rgba(240, 113, 120, 0.35)' : 'rgba(45, 212, 168, 0.3)'}
            >
              {d.type === 'shortage' ? 'Shortage' : 'Surplus'}: {d.commodity} ({d.turnsLeft}t)
            </Text>
          ))}
        </Flex>
      )}

      {/* Desktop table */}
      <Box overflowX="auto" display={{ base: 'none', md: 'block' }}>
        <Box as="table" w="100%" css={{ borderCollapse: 'collapse' }} fontSize="0.92rem">
          <Box as="thead">
            <Box as="tr">
              {['Commodity', 'Price', 'Trend', 'Owned', 'Qty', 'Buy', 'Sell'].map((h) => (
                <Box key={h} as="th" textAlign="left" fontSize="0.72rem" textTransform="uppercase" letterSpacing="0.06em" color="#8b9bb8" px={2} py={2} borderBottom="1px solid" borderColor="#243049">
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {LEGAL_COMMODITIES.map((commodity) => {
              const price = prices[commodity];
              const owned = state.cargo[commodity] || 0;
              const qty = qtyOf(commodity);
              const maxB = maxBuyQty(state.credits, free, price);
              const cost = price * qty;
              const canBuy = !state.gameOver && qty <= maxB && maxB > 0;
              const canSell = !state.gameOver && owned >= qty && qty > 0;
              const series = history[commodity] || [price];

              return (
                <Box as="tr" key={commodity} css={{ '& td': { borderBottom: '1px solid rgba(36, 48, 73, 0.7)' }, '&:last-child td': { borderBottom: 'none' } }}>
                  <Box as="td" px={2} py={2.5} fontWeight={600}>
                    <Text as="span" aria-hidden="true">{COMMODITY_ICONS[commodity] || '📦'}</Text> {commodity}{demandTag(commodity)}
                  </Box>
                  <Box as="td" px={2} py={2.5} fontFamily="mono">{fmt(price)}</Box>
                  <Box as="td" px={2} py={2.5} minW="56px"><Sparkline values={series} /></Box>
                  <Box as="td" px={2} py={2.5} fontFamily="mono">{owned}</Box>
                  <Box as="td" px={2} py={2.5}>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={qtys[commodity] ?? 1}
                      disabled={state.gameOver}
                      onChange={(e) => setQty(commodity, e.target.value)}
                      aria-label={`${commodity} quantity`}
                      w="3.5rem"
                      bg="#070b14"
                      border="1px solid"
                      borderColor="#243049"
                      borderRadius="6px"
                      px={1.5}
                      py={1}
                      textAlign="center"
                      fontFamily="mono"
                      fontSize="0.85rem"
                      color="#e8eef8"
                      _focus={{ borderColor: '#4cc9f0', boxShadow: '0 0 0 1px #4cc9f0' }}
                    />
                  </Box>
                  <Box as="td" px={2} py={2.5}>
                    <VStack gap={1} align="stretch">
                      <Button size="xs" border="1px solid" borderRadius="6px" minW="3.5rem" {...btnBuy} disabled={!canBuy} onClick={() => onBuy(commodity, qty)} title={canBuy ? `Buy ${qty} for ${fmt(cost)}` : 'Not enough credits or cargo space'}>Buy</Button>
                      <Button size="xs" border="1px solid" borderRadius="6px" minW="3.5rem" {...btnBuy} disabled={state.gameOver || maxB <= 0} onClick={() => { if (maxB > 0) { setQty(commodity, maxB); onBuy(commodity, maxB); } }}>Max</Button>
                    </VStack>
                  </Box>
                  <Box as="td" px={2} py={2.5}>
                    <VStack gap={1} align="stretch">
                      <Button size="xs" border="1px solid" borderRadius="6px" minW="3.5rem" {...btnSell} disabled={!canSell} onClick={() => onSell(commodity, qty)} title={canSell ? `Sell ${qty} for ${fmt(price * qty)}` : 'Not enough cargo to sell'}>Sell</Button>
                      <Button size="xs" border="1px solid" borderRadius="6px" minW="3.5rem" {...btnSell} disabled={state.gameOver || owned <= 0} onClick={() => { if (owned > 0) { setQty(commodity, owned); onSell(commodity, owned); } }}>All</Button>
                    </VStack>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Mobile card list */}
      <VStack as="ul" listStyleType="none" m={0} p={0} gap={3} align="stretch" display={{ base: 'flex', md: 'none' }}>
        {LEGAL_COMMODITIES.map((commodity) => {
          const price = prices[commodity];
          const owned = state.cargo[commodity] || 0;
          const qty = qtyOf(commodity);
          const maxB = maxBuyQty(state.credits, free, price);
          const cost = price * qty;
          const canBuy = !state.gameOver && qty <= maxB && maxB > 0;
          const canSell = !state.gameOver && owned >= qty && qty > 0;
          const series = history[commodity] || [price];

          return (
            <Box as="li" key={commodity} p={3} bg="#070b14" border="1px solid" borderColor="#243049" borderRadius="10px">
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text fontWeight={600} fontSize="0.98rem">
                    <Text as="span" aria-hidden="true">{COMMODITY_ICONS[commodity] || '📦'}</Text> {commodity}
                  </Text>
                  <Text mt={0.5} color="#8b9bb8" fontFamily="mono" fontSize="0.75rem">
                    Owned {owned} · Max buy {maxB}
                  </Text>
                </Box>
                {demandTag(commodity)}
              </Flex>

              <Flex align="center" justify="space-between" mt={3} px={2.5} py={2.5} borderRadius="8px" bg="rgba(20, 30, 51, 0.7)" color="#8b9bb8" fontSize="0.82rem">
                <Text>Price <Text as="strong" color="#f6e05e" fontFamily="mono">{fmt(price)}</Text></Text>
                <Sparkline values={series} />
              </Flex>

              <VStack gap={3} mt={3} align="stretch">
                <Flex direction="column" gap={1}>
                  <Text fontSize="0.72rem" textTransform="uppercase" letterSpacing="0.06em" color="#8b9bb8">Qty</Text>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={qtys[commodity] ?? 1}
                    disabled={state.gameOver}
                    onChange={(e) => setQty(commodity, e.target.value)}
                    aria-label={`${commodity} quantity`}
                    bg="#070b14"
                    border="1px solid"
                    borderColor="#243049"
                    borderRadius="6px"
                    px={2}
                    py={2}
                    textAlign="center"
                    fontFamily="mono"
                    fontSize="1rem"
                    minH="40px"
                    color="#e8eef8"
                    _focus={{ borderColor: '#4cc9f0', boxShadow: '0 0 0 1px #4cc9f0' }}
                  />
                </Flex>
                <Grid templateColumns="1fr 1fr" gap={2}>
                  <Button size="sm" border="1px solid" borderRadius="8px" minH="44px" w="100%" {...btnBuy} disabled={!canBuy} onClick={() => onBuy(commodity, qty)}>Buy</Button>
                  <Button size="sm" border="1px solid" borderRadius="8px" minH="44px" w="100%" {...btnBuy} disabled={state.gameOver || maxB <= 0} onClick={() => { if (maxB > 0) { setQty(commodity, maxB); onBuy(commodity, maxB); } }}>Max</Button>
                  <Button size="sm" border="1px solid" borderRadius="8px" minH="44px" w="100%" {...btnSell} disabled={!canSell} onClick={() => onSell(commodity, qty)}>Sell</Button>
                  <Button size="sm" border="1px solid" borderRadius="8px" minH="44px" w="100%" {...btnSell} disabled={state.gameOver || owned <= 0} onClick={() => { if (owned > 0) { setQty(commodity, owned); onSell(commodity, owned); } }}>All</Button>
                </Grid>
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </GamePanel>
  );
}
