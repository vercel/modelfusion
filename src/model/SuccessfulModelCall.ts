import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelInformation } from "./ModelInformation.js";

export type SuccessfulModelCall = {
  type:
    | "image-generation"
    | "text-generation"
    | "text-embedding"
    | "transcription";
  model: ModelInformation;
  settings: unknown;
  response: unknown;
};

export function extractSuccessfulModelCalls(
  modelCallEvents: (ModelCallFinishedEvent | ModelCallStartedEvent)[]
) {
  return modelCallEvents
    .filter(
      (event): event is ModelCallFinishedEvent & { status: "success" } =>
        "status" in event && event.status === "success"
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
  "text-embedding-finished": "text-embedding" as const,
  "text-generation-finished": "text-generation" as const,
  "transcription-finished": "transcription" as const,
};
