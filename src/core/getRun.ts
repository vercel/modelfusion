import { Run } from "./Run";

interface RunStorage {
  getStore: () => Run | undefined;
  run: (context: Run, callback: () => void) => void;
}

let runStorage: RunStorage | undefined;

const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

async function ensureLoaded() {
  if (!isNode) return Promise.resolve();
  if (!runStorage) {
    const { AsyncLocalStorage } = await import("node:async_hooks");
    runStorage = new AsyncLocalStorage<Run>();
  }
  return Promise.resolve();
}

export async function getRun(run?: Run): Promise<Run | undefined> {
  await ensureLoaded();
  return run ?? runStorage?.getStore();
}

export async function withRun(run: Run, callback: () => PromiseLike<void>) {
  await ensureLoaded();
  if (runStorage != null) {
    await runStorage.run(run, callback);
  } else {
    await callback();
  }
}
