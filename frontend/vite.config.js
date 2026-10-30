import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.DEV_PORT || 5175),
    strictPort: process.env.DEV_STRICT_PORT === "true",
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:3001",
        changeOrigin: true,
      },
    },
    watch: { usePolling: process.env.USE_POLLING === "true" },
  },
});
