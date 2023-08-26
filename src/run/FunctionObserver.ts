import { FunctionEvent } from "./FunctionEvent.js";

export type FunctionObserver = {
  onFunctionEvent?: (event: FunctionEvent) => void;
};
