import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/thai-address/",
  root: "demo",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../demo-dist",
    emptyOutDir: true
  },
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  }
});
