import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    sourcemap: true,
  },
  {
    entry: ["src/internal/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/internal",
    sourcemap: true,
  },
  {
    entry: ["src/node/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/node",
    sourcemap: true,
  },
]);
