import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    sourcemap: true,
  },
  {
    entry: ["src/browser/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/browser",
    sourcemap: true,
  },
  {
    entry: ["src/server/fastify/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/fastify-server",
    sourcemap: true,
  },
]);
