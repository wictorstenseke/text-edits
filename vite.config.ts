import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tailwindcss()],
  base: process.env.BASE_PATH || "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // html2canvas has no "exports" field; point to ESM build for reliable resolution
      html2canvas: path.resolve(
        __dirname,
        "node_modules/html2canvas/dist/html2canvas.esm.js"
      ),
    },
  },
  optimizeDeps: {
    include: ["html2canvas", "jspdf"],
  },
});
