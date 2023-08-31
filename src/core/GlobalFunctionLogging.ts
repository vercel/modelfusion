import { FunctionLogging } from "./FunctionOptions.js";

let globalFunctionLogging: FunctionLogging = undefined;

export function setGlobalFunctionLogging(logLevel: FunctionLogging): void {
  globalFunctionLogging = logLevel;
}

export function getGlobalFunctionLogging(): FunctionLogging {
  return globalFunctionLogging;
}
