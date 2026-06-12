import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  tsr: {
    generatedRouteTree: "./src/routeTree.gen.ts",
    routesDirectory: "./src/routes",
  },
  vite: {
    plugins: [react(), tsConfigPaths(), tailwindcss()],
    resolve: {
      alias: { "@": "/src" },
      dedupe: ["react", "react-dom", "@tanstack/react-router"],
    },
  },
});
