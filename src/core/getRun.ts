import { AsyncLocalStorage } from "node:async_hooks";
import { Run } from "./Run";

const asyncLocalStorage = new AsyncLocalStorage<Run>();

export function getRun(run?: Run): Run | undefined {
  return run ?? asyncLocalStorage?.getStore();
}

export function withRun(run: Run, callback: () => void) {
  asyncLocalStorage.run(run, callback);
}
