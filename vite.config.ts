import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const configuredBasePath =
  process.env["VITE_BASE_PATH"] || process.env["SPA_LOADER_BASE_PATH"] || "/";
const base = `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
});
