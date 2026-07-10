import { Box, Flex, Text } from '@chakra-ui/react';

export default function NewsTicker({ news }) {
  const items = news || [];
  if (!items.length) return null;

  return (
    <Flex
      role="status"
      aria-live="polite"
      align="stretch"
      mt={3}
      border="1px solid"
      borderColor="#243049"
      borderRadius="12px"
      overflow="hidden"
      bg="#0f1626"
      fontSize="0.82rem"
    >
      <Flex
        flexShrink={0}
        px={3}
        py={2}
        bg="rgba(58, 184, 224, 0.15)"
        color="#4cc9f0"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.08em"
        fontSize="0.7rem"
        align="center"
      >
        News
      </Flex>
      <Flex flexWrap="wrap" gap="6px 14px" px={3} py={2} overflow="hidden">
        {items.slice(0, 6).map((n, i) => (
          <Text
            key={`${i}-${n.slice(0, 12)}`}
            color="#8b9bb8"
            whiteSpace="nowrap"
            maxW="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            _before={{ content: '"\\B7 "', color: '#4cc9f0' }}
          >
            {n}
          </Text>
        ))}
      </Flex>
    </Flex>
  );
}
