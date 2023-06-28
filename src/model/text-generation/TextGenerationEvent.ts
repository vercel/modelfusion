import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallObserver.js";

export type TextGenerationStartedEvent = {
  type: "text-generation-started";
  metadata: ModelCallStartedEventMetadata;
  prompt: unknown;
};

export type TextGenerationFinishedEvent = {
  type: "text-generation-finished";
  metadata: ModelCallFinishedEventMetadata;
  prompt: unknown;
} & (
  | {
      status: "success";
      generatedText: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
