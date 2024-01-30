import path from "path";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
