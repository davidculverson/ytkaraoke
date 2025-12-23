/// <reference types="node" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120000, // 2 minutes default timeout for Azure operations
    hookTimeout: 300000, // 5 minutes for setup/teardown
    include: ['tests/azure/**/*.test.ts'],
    globals: true,
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/azure-deployment-report.html',
    },
    pool: 'forks', // Use forks for better isolation
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially
      },
    },
  },
});
