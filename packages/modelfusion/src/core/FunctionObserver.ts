import { FunctionEvent } from "./FunctionEvent";

export interface FunctionObserver {
  /**
   * Called when a function event occurs.
   */
  onFunctionEvent(event: FunctionEvent): void;
}
