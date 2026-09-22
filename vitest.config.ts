import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // `server-only` throws outside a React Server environment; the tests never
    // import it (they test domain/infra pieces directly), but keep the guard clear.
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/lib/format.ts', 'src/lib/utils.ts', 'src/infra/mail/**', 'src/infra/storage/**'],
      reporter: ['text', 'html'],
    },
  },
});
