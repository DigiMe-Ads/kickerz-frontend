import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The site is deployed to the ROOT of public_html on Hostinger shared hosting.
// Output is plain static files - no Node runtime is required on the server.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Keeps the uploaded file list small and predictable for manual FTP deploys.
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    open: true,
  },
});
