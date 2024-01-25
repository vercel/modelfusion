import { LlamaCppBindings } from "./binding.js";
import { test, expect } from "vitest";

test("testModule", () => {
  expect(LlamaCppBindings).toBeDefined();
  expect(LlamaCppBindings.getSystemInfo).toBeDefined();
});

test("testBasic", async () => {
  const instance = new LlamaCppBindings("mistral");
  expect(instance.greet).toBeDefined();
  expect(instance.greet("kermit")).toBe("mistral");
  await expect(LlamaCppBindings.getSystemInfo()).resolves.toContain(" | ");
});
