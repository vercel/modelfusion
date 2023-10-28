import { FunctionEvent } from "modelfusion";
import { FlowRun } from "./FlowRun";

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
