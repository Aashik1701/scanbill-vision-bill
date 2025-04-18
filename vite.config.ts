// filepath: /Users/aashik/MyCourse/Computer Vision/scanbill-vision-bill/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix for onnxruntime-web
      "onnxruntime-web": path.resolve(__dirname, "node_modules/onnxruntime-web/dist/ort.es6.min.js"),
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
    esbuildOptions: {
      target: 'esnext', // Needed for WASM support
    },
  },
  // Add support for WASM files
  assetsInclude: ['**/*.wasm'],
  build: {
    target: 'esnext', // Needed for WASM support
    commonjsOptions: {
      include: [/onnxruntime-web/, /node_modules/],
    },
  },
}));