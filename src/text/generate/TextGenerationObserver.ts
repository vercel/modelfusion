import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export interface TextGenerationObserver {
  onTextGenerationStarted?: (event: TextGenerationStartedEvent) => void;
  onTextGenerationFinished?: (event: TextGenerationFinishedEvent) => void;
}

export type TextGenerationStartedEvent = {
  type: "text-generation-started";
  metadata: IdMetadata & {
    model: ModelInformation;
    generateTextCallId: string;
    startEpochSeconds: number;
  };
  prompt: unknown;
};

export type TextGenerationFinishedEvent = {
  type: "text-generation-finished";
  metadata: IdMetadata & {
    model: ModelInformation;
    generateTextCallId: string;
    startEpochSeconds: number;
    durationInMs: number;
  };
  prompt: unknown;
} & (
  | {
      status: "success";
      generatedText: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
