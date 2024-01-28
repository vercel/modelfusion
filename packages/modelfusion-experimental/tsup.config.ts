import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/browser/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/browser",
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/server/fastify/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/fastify-server",
    dts: true,
    sourcemap: true,
  },
]);
