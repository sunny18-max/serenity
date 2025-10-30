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
      host: "::",
      port: 8080,
      // 👇 Add this section to allow Render backend host
      allowedHosts: ["serenity-s1io.onrender.com"],
      // Optional: If you use proxy for API calls in local dev
      proxy: {
        "/api": {
          target: "https://serenity-s1io.onrender.com",
          changeOrigin: true,
          secure: true,
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
