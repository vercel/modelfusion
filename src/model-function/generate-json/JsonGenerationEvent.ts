import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "../ModelCallEvent.js";

export type JsonGenerationStartedEvent = {
  type: "json-generation-started" | "json-or-text-generation-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  prompt: unknown;
};

export type JsonGenerationFinishedEvent = {
  type: "json-generation-finished" | "json-or-text-generation-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  prompt: unknown;
} & (
  | {
      status: "success";
      response: unknown;
      generatedJson: unknown;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
