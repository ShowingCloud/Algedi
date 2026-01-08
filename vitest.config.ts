import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
    ],
  },
  resolve: {
    alias: {
      '@repo/ai-editor': path.resolve(__dirname, './packages/ai-editor/src'),
      '@repo/cms': path.resolve(__dirname, './packages/cms/src'),
      '@repo/commerce': path.resolve(__dirname, './packages/commerce/src'),
      '@repo/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
