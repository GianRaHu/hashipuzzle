
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  server: {
    allowedHosts: [
      '9464df3c-5cea-4919-9737-0a39aca6b984.lovableproject.com',
      // Add other allowed hosts if necessary
    ],
    host: "::",
    port: 8080
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Skip checking tsconfig.node.json entirely
      tsconfig: './tsconfig.app.json'
    }
  }
}));
