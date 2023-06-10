import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type ImageGenerationObserver = {
  onImageGenerationStarted?: (event: ImageGenerationStartedEvent) => void;
  onImageGenerationFinished?: (event: ImageGenerationFinishedEvent) => void;
};

export type ImageGenerationStartedEvent = {
  type: "image-generation-started";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
  };
  prompt: unknown;
};

export type ImageGenerationFinishedEvent = {
  type: "image-generation-finished";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
    durationInMs: number;
  };
  prompt: unknown;
} & (
  | {
      status: "success";
      generatedImage: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
