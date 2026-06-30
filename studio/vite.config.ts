import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Front-end do Acelera Studio. Em dev, faz proxy de /api para o backend FastAPI.
// Ajuste o target se o backend rodar em outra porta/host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});
