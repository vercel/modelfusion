import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "../ModelCallEvent.js";

export type TextGenerationStartedEvent = {
  type: "text-generation-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  prompt: unknown;
};

export type TextGenerationFinishedEvent = {
  type: "text-generation-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  prompt: unknown;
} & (
  | {
      status: "success";
      response: unknown;
      generatedText: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
