import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc"; // Use SWC plugin
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  
  return {
    base: '/',
    envDir: path.resolve(__dirname, '..'),
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        external: [],
        output: {
          manualChunks: undefined,
        },
      },
    },
    // Remove server configuration for production
    ...(mode === 'development' && {
      server: {
        host: true,
        port: 8080,
        proxy: {
          '/api': {
            target: process.env.VITE_BACKEND_API_URL || 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
      },
    }),
  };
});