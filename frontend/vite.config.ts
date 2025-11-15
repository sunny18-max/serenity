import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load env file from parent directory (root) and current directory
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  
  return {
    base: '/',
    envDir: path.resolve(__dirname, '..'), // Look for .env in parent directory
    server: {
<<<<<<< HEAD
      host: true, // Allow all hosts in development
=======
>>>>>>> 51c2ae49e1824c7ece512a44d5fd47d09c32c84c
      port: 8080,
      // Configure proxy for development
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: process.env.NODE_ENV === 'production',
          rewrite: (path) => path.replace(/^\/api/, ''),
          // Add CORS headers
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', {
                method: req.method,
                url: req.url,
                headers: req.headers,
              });
            });
          },
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
