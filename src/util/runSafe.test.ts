import { expect, test } from "vitest";
import { runSafe } from "./runSafe.js";

test("catch thrown error in sync function", async () => {
  const error = new Error("test error");

  const result = await runSafe(() => {
    throw error;
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

test("catch thrown string in sync function", async () => {
  const result = await runSafe(() => {
    throw "test error";
  });

  expect(result).toEqual({
    ok: false,
    error: "test error",
  });
});

test("catch thrown error in async function", async () => {
  const error = new Error("test error");

  const result = await runSafe(async () => {
    throw error;
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

test("catch thrown string in async function", async () => {
  const result = await runSafe(async () => {
    throw "test error";
  });

  expect(result).toEqual({
    ok: false,
    error: "test error",
  });
});

test("catch rejected Promise", async () => {
  const error = new Error("test error");

  const result = await runSafe(async () => {
    return Promise.reject(error);
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

test("no error", async () => {
  const result = await runSafe(async () => "result");

  expect(result).toEqual({
    ok: true,
    value: "result",
  });
});
