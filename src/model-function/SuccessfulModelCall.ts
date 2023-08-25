import { FunctionEvent } from "../run/FunctionEvent.js";
import { ModelCallFinishedEvent } from "./ModelCallEvent.js";
import { ModelInformation } from "./ModelInformation.js";

export type SuccessfulModelCall = {
  type:
    | "image-generation"
    | "json-generation"
    | "json-or-text-generation"
    | "speech-synthesis"
    | "text-embedding"
    | "text-generation"
    | "text-streaming"
    | "transcription";
  model: ModelInformation;
  settings: unknown;
  response: unknown;
};

export function extractSuccessfulModelCalls(
  runFunctionEvents: FunctionEvent[]
) {
  return runFunctionEvents
    .filter(
      (event): event is ModelCallFinishedEvent & { status: "success" } =>
        Object.keys(eventTypeToCostType).includes(event.type) &&
        "status" in event &&
        event.status === "success"
    )
    .map(
      (event): SuccessfulModelCall => ({
        model: event.metadata.model,
        settings: event.settings,
        response: event.response,
        type: eventTypeToCostType[event.type],
      })
    );
}

const eventTypeToCostType = {
  "image-generation-finished": "image-generation" as const,
  "json-generation-finished": "json-generation" as const,
  "json-or-text-generation-finished": "json-or-text-generation" as const,
  "speech-synthesis-finished": "speech-synthesis" as const,
  "text-embedding-finished": "text-embedding" as const,
  "text-generation-finished": "text-generation" as const,
  "text-streaming-finished": "text-streaming" as const,
  "transcription-finished": "transcription" as const,
};
