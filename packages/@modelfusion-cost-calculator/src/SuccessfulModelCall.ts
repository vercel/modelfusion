import { FunctionEvent, ModelCallFinishedEvent } from "modelfusion";

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
