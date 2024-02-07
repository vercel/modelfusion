import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/internal/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/internal",
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/server/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist/server",
    dts: true,
    sourcemap: true,
  },
]);
