import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        devtools: resolve(__dirname, 'devtools.html'),
      },
    },
  },
  plugins: [react(), crx({ manifest }), tsconfigPaths()],
});
