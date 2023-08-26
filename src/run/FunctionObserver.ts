import { FunctionEvent } from "./FunctionEvent.js";

export interface FunctionObserver {
  /**
   * Called when a function event occurs.
   */
  onFunctionEvent(event: FunctionEvent): void;
}
