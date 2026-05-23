import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), crx({ manifest })],
});
