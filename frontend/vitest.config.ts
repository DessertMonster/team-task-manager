import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
});
