import { FunctionEvent } from "../../core/FunctionEvent.js";
import { FlowRun } from "./FlowRun.js";

export interface Logger {
  logFunctionEvent(options: {
    run: FlowRun<unknown>;
    event: FunctionEvent;
  }): Promise<void>;

  logError(options: {
    run: FlowRun<unknown>;
    message: string;
    error: unknown;
  }): Promise<void>;
}
