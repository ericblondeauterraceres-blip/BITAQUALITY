import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Deux cibles depuis le même code :
//  - mode "production" (défaut) : site Netlify, données partagées via Netlify Functions + Blobs
//  - mode "standalone" : un seul fichier HTML autoporté, données dans le navigateur
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    plugins: standalone ? [react(), viteSingleFile()] : [react()],
    define: { __TARGET__: JSON.stringify(standalone ? 'standalone' : 'netlify') },
    build: { outDir: standalone ? 'dist-standalone' : 'dist', chunkSizeWarningLimit: 3000 },
    test: { environment: 'node' },
  };
});
