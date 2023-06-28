import {
  FinishedEventMetadata,
  StartedEventMetadata,
} from "../EventMetadata.js";

export type ImageGenerationObserver = {
  onImageGenerationStarted?: (event: ImageGenerationStartedEvent) => void;
  onImageGenerationFinished?: (event: ImageGenerationFinishedEvent) => void;
};

export type ImageGenerationStartedEvent = {
  type: "image-generation-started";
  metadata: StartedEventMetadata;
  prompt: unknown;
};

export type ImageGenerationFinishedEvent = {
  type: "image-generation-finished";
  metadata: FinishedEventMetadata;
  prompt: unknown;
} & (
  | {
      status: "success";
      generatedImage: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
