import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for CellDrop.
// The counting engine runs fully client side, so no proxy or server config is required.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
