import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      input: {
        devtools: resolve(__dirname, 'devtools.html'),
      },
    },
  },
  plugins: [react(), crx({ manifest })],
});
