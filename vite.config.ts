import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    assetsInlineLimit: 0,
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
        compact: true,
      },
    },
    chunkSizeWarningLimit: 500,
    target: "es2020",
    cssCodeSplit: false,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: true,
    open: false,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
