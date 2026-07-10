import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  globalCss: {
    'html, body': {
      bg: '#070b14',
      color: '#e8eef8',
      lineHeight: '1.45',
    },
  },
});

const system = createSystem(defaultConfig, customConfig);
export default system;
