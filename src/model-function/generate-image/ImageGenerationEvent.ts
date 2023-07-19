import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "../ModelCallEvent.js";

export type ImageGenerationStartedEvent = {
  type: "image-generation-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  prompt: unknown;
};

export type ImageGenerationFinishedEvent = {
  type: "image-generation-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  prompt: unknown;
} & (
  | {
      status: "success";
      response: unknown;
      generatedImage: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
