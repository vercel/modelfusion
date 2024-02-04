import { detectRuntime } from "../util/detectRuntime";
import { Run } from "./Run";

interface RunStorage {
  getStore: () => Run | undefined;
  run: (context: Run, callback: () => void) => void;
}

let runStorage: RunStorage | undefined;

async function ensureLoaded() {
  if (detectRuntime() === "node" && !runStorage) {
    // Note: using "async_hooks" instead of "node:async_hooks" to avoid webpack fallback problems.
    // Note: we try both import and require to support both ESM and CJS.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let AsyncLocalStorage: any;

    try {
      AsyncLocalStorage = (await import("async_hooks")).AsyncLocalStorage;
    } catch (error) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        AsyncLocalStorage = require("async_hooks").AsyncLocalStorage;
      } catch (error) {
        throw new Error(`Failed to load 'async_hooks' module dynamically.`);
      }
    }

    runStorage = new AsyncLocalStorage();
  }

  return Promise.resolve();
}

/**
 * Returns the run stored in an AsyncLocalStorage if running in Node.js. It can be set with `withRun()`.
 */
export async function getRun(run?: Run): Promise<Run | undefined> {
  await ensureLoaded();
  return run ?? runStorage?.getStore();
}

/**
 * Stores the run in an AsyncLocalStorage if running in Node.js. It can be retrieved with `getRun()`.
 */
export async function withRun(
  run: Run,
  callback: (run: Run) => PromiseLike<void>
) {
  await ensureLoaded();
  if (runStorage != null) {
    await runStorage.run(run, () => callback(run));
  } else {
    await callback(run);
  }
}
