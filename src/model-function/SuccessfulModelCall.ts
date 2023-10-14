import { FunctionEvent } from "../core/FunctionEvent.js";
import { ModelCallFinishedEvent } from "./ModelCallEvent.js";

export type SuccessfulModelCall = ModelCallFinishedEvent & {
  result: { status: "success" };
};

export function extractSuccessfulModelCalls(
  runFunctionEvents: FunctionEvent[]
) {
  return runFunctionEvents.filter(
    (
      event
    ): event is ModelCallFinishedEvent & { result: { status: "success" } } =>
      "model" in event &&
      "result" in event &&
      "status" in event.result &&
      event.result.status === "success"
  );
}
