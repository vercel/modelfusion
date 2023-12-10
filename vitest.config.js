import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
