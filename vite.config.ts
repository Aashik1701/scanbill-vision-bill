// filepath: /Users/aashik/MyCourse/Computer Vision/scanbill-vision-bill/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Changed from react-swc
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));