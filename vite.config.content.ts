import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Separate Vite config for building the content script
// Content scripts need to be bundled as a single IIFE file
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear main build output
    copyPublicDir: false,
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, 'content/content.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        // Inline all dependencies into single file
        manualChunks: undefined,
        inlineDynamicImports: true,
        format: 'iife',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
