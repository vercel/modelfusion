import { FunctionObserver } from "./FunctionObserver.js";

let globalFunctionObservers: FunctionObserver[] = [];

export function setGlobalFunctionObservers(
  functionObservers: FunctionObserver[]
): void {
  globalFunctionObservers = functionObservers;
}

export function getGlobalFunctionObservers(): FunctionObserver[] {
  return globalFunctionObservers;
}
