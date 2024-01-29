import { FunctionObserver } from "./FunctionObserver";
import { LogFormat } from "./LogFormat";

let globalLogFormat: LogFormat = undefined;
let globalFunctionObservers: FunctionObserver[] = [];

export function setFunctionObservers(
  functionObservers: FunctionObserver[]
): void {
  globalFunctionObservers = functionObservers;
}

export function getFunctionObservers(): FunctionObserver[] {
  return globalFunctionObservers;
}

export function setLogFormat(format: LogFormat): void {
  globalLogFormat = format;
}

export function getLogFormat(): LogFormat {
  return globalLogFormat;
}
