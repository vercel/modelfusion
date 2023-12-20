import { runSafe } from "./runSafe.js";

it("should catch thrown error in sync function", async () => {
  const error = new Error("test error");

  const result = await runSafe(() => {
    throw error;
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

it("should catch thrown string in sync function", async () => {
  const result = await runSafe(() => {
    throw "test error";
  });

  expect(result).toEqual({
    ok: false,
    error: "test error",
  });
});

it("should catch thrown error in async function", async () => {
  const error = new Error("test error");

  const result = await runSafe(async () => {
    throw error;
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

it("should catch thrown string in async function", async () => {
  const result = await runSafe(async () => {
    throw "test error";
  });

  expect(result).toEqual({
    ok: false,
    error: "test error",
  });
});

it("should catch rejected Promise", async () => {
  const error = new Error("test error");

  const result = await runSafe(async () => {
    return Promise.reject(error);
  });

  expect(result).toEqual({
    ok: false,
    error,
  });
});

it("should not throw error", async () => {
  const result = await runSafe(async () => "result");

  expect(result).toEqual({
    ok: true,
    value: "result",
  });
});
