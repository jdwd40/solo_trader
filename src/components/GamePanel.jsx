import { Box, Flex, Heading } from '@chakra-ui/react';

export default function GamePanel({ title, badge, badgeMuted, icon, children, ...rest }) {
  return (
    <Box
      bg="#0f1626"
      border="1px solid"
      borderColor="#243049"
      borderRadius="12px"
      p={{ base: '14px', md: '16px 18px' }}
      boxShadow="0 8px 28px rgba(0, 0, 0, 0.35)"
      {...rest}
    >
      {title && (
        <Flex align="center" justify="space-between" gap={3} mb={3}>
          <Heading as="h2" fontSize={{ base: '0.95rem', md: '1.05rem' }} fontWeight={600} display="flex" alignItems="center" gap={2}>
            {icon && <Box as="span" aria-hidden="true">{icon}</Box>}
            {title}
          </Heading>
          {badge != null && (
            <Box
              as="span"
              fontFamily="mono"
              fontSize="0.78rem"
              px={2}
              py={0.5}
              borderRadius="full"
              bg={badgeMuted ? 'rgba(139, 155, 184, 0.1)' : 'rgba(76, 201, 240, 0.12)'}
              color={badgeMuted ? '#8b9bb8' : '#4cc9f0'}
              border="1px solid"
              borderColor={badgeMuted ? '#243049' : 'rgba(76, 201, 240, 0.25)'}
              fontWeight={600}
              whiteSpace="nowrap"
            >
              {badge}
            </Box>
          )}
        </Flex>
      )}
      {children}
    </Box>
  );
}
