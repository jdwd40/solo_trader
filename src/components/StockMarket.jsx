import { useState } from 'react';
import { VStack, HStack, Text, Button, Box } from '@chakra-ui/react';
import { STOCK_INDICES } from '../data/gameData';
import { fmt, marketBook, portfolioValue } from '../utils/gameLogic';
import GamePanel from './GamePanel';

/**
 * Sector Exchange — real bid/ask microstructure.
 *
 * - Buy  = take the market ask (you pay up for immediacy)
 * - Sell = hit the market bid (you give up for immediacy)
 * - Make 2-way = post both bid & ask; other traders may fill you on jumps
 *   (you earn the spread when both sides fill; adverse selection when mid runs)
 */
export default function StockMarket({
  state,
  onBuy,
  onSell,
  onPostQuote,
  onPullQuote,
}) {
  const [shares, setShares] = useState(1);
  const [mmSize, setMmSize] = useState(3);
  const qty = Math.max(1, Math.min(99, Math.floor(Number(shares) || 1)));
  const quoteSize = Math.max(1, Math.min(99, Math.floor(Number(mmSize) || 1)));
  const prices = state.stockPrices || {};
  const portfolio = state.portfolio || {};
  const quotes = state.stockQuotes || {};
  const total = portfolioValue(portfolio, prices);
  const locked = state.gameOver || state.needsHullSelect;

  return (
    <GamePanel
      title="📈 Sector Exchange"
      badge={fmt(total) + ' cr'}
    >
      <VStack gap={4} align="stretch">
        {/* Description */}
        <Text color="#8b9bb8" fontSize="sm">
          <strong>Take the ask</strong> to buy. <strong>Hit the bid</strong> to sell.
          Or <strong>make a 2-way market</strong> — post both sides and let flow
          trade against you on jumps (spread income, inventory risk).
        </Text>

        {/* Size inputs */}
        <HStack gap={4} wrap="wrap">
          <HStack gap={2} align="flex-end">
            <Text color="#8b9bb8" fontSize="sm" whiteSpace="nowrap">
              ⚡ Take size
            </Text>
            <input
              id="stock-qty"
              type="number"
              min={1}
              max={99}
              value={shares}
              disabled={locked}
              onChange={(e) => setShares(e.target.value)}
              style={{
                background: '#141e33',
                border: '1px solid #243049',
                color: '#e8eef8',
                padding: '8px 12px',
                borderRadius: '6px',
                width: '70px',
                fontSize: '14px',
              }}
            />
          </HStack>
          <HStack gap={2} align="flex-end">
            <Text color="#8b9bb8" fontSize="sm" whiteSpace="nowrap">
              🏦 Quote size
            </Text>
            <input
              id="mm-qty"
              type="number"
              min={1}
              max={99}
              value={mmSize}
              disabled={locked}
              onChange={(e) => setMmSize(e.target.value)}
              style={{
                background: '#141e33',
                border: '1px solid #243049',
                color: '#e8eef8',
                padding: '8px 12px',
                borderRadius: '6px',
                width: '70px',
                fontSize: '14px',
              }}
            />
          </HStack>
        </HStack>

        {/* Stock list */}
        <VStack gap={3} align="stretch">
          {Object.values(STOCK_INDICES).map((idx) => {
            const mid = prices[idx.id] ?? idx.base;
            const book = marketBook(mid, state.season, idx.id);
            const owned = portfolio[idx.id] || 0;
            const takeCost = book.ask * qty;
            const hitRevenue = book.bid * qty;
            const q = quotes[idx.id];
            const making = Boolean(q && (q.bidSize > 0 || q.askSize > 0));

            return (
              <Box
                key={idx.id}
                p={3}
                bg={making ? '#1a2537' : '#141e33'}
                borderRadius="6px"
                borderLeft={making ? '3px solid #4cc9f0' : 'none'}
              >
                <VStack gap={3} align="stretch">
                  {/* Stock info */}
                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="bold" color="#e8eef8">
                      {idx.name}
                    </Text>
                    <Text fontSize="xs" color="#8b9bb8">
                      {idx.blurb}
                    </Text>
                  </VStack>

                  {/* Order book */}
                  <HStack
                    gap={2}
                    justify="space-between"
                    p={2}
                    bg="#0f1626"
                    borderRadius="4px"
                    fontSize="xs"
                    fontFamily="mono"
                  >
                    <HStack gap={1}>
                      <Text color="#2dd4a8" fontWeight="bold" title="Market bid — hit this to sell">
                        Bid {fmt(book.bid)}
                      </Text>
                    </HStack>
                    <HStack gap={1}>
                      <Text color="#e8eef8" title="Mid / last">
                        Mid {fmt(book.mid)}
                      </Text>
                    </HStack>
                    <HStack gap={1}>
                      <Text color="#f0a04b" fontWeight="bold" title="Market ask — take this to buy">
                        Ask {fmt(book.ask)}
                      </Text>
                    </HStack>
                    <HStack gap={1}>
                      <Text color="#8b9bb8">
                        Spr {fmt(book.spread)}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Position & quote status */}
                  <Text fontSize="xs" color="#8b9bb8" fontFamily="mono">
                    Own {owned}
                    {making
                      ? ` · quoting ${q.bidSize || 0}×${q.askSize || 0}`
                      : ''}
                  </Text>

                  {/* Action buttons */}
                  <VStack gap={2} align="stretch">
                    <HStack gap={2}>
                      <Button
                        size="xs"
                        isDisabled={locked || takeCost > state.credits}
                        title={`Take ask: buy ${qty} @ ${fmt(book.ask)} = ${fmt(takeCost)} cr`}
                        onClick={() => onBuy(idx.id, qty)}
                        bg="#2dd4a8"
                        color="#070b14"
                        _hover={{ bg: '#3fe4b8' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        fontWeight="bold"
                        flex={1}
                      >
                        📈 Take ask
                      </Button>
                      <Button
                        size="xs"
                        isDisabled={locked || owned < qty}
                        title={`Hit bid: sell ${qty} @ ${fmt(book.bid)} = ${fmt(hitRevenue)} cr`}
                        onClick={() => onSell(idx.id, qty)}
                        bg="#f0a04b"
                        color="#070b14"
                        _hover={{ bg: '#fdb05d' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        fontWeight="bold"
                        flex={1}
                      >
                        📉 Hit bid
                      </Button>
                    </HStack>
                    <HStack gap={2}>
                      <Button
                        size="xs"
                        isDisabled={
                          locked ||
                          owned < quoteSize ||
                          book.bid * quoteSize > state.credits
                        }
                        title={`Post 2-way: bid ${quoteSize}@${fmt(book.bid)} · ask ${quoteSize}@${fmt(book.ask)}. Fills on jumps.`}
                        onClick={() => onPostQuote(idx.id, quoteSize, quoteSize)}
                        bg="#8b9bb8"
                        color="#070b14"
                        _hover={{ bg: '#a8bcd4' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        fontWeight="bold"
                        flex={1}
                      >
                        🏦 Make 2-way
                      </Button>
                      <Button
                        size="xs"
                        isDisabled={locked || !making}
                        title="Cancel resting quotes"
                        onClick={() => onPullQuote(idx.id)}
                        bg="#243049"
                        color="#e8eef8"
                        _hover={{ bg: '#2e4a7a' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        fontWeight="bold"
                        flex={1}
                      >
                        ✖️ Pull
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </GamePanel>
  );
}
