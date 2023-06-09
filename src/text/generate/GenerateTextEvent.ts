import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type GenerateTextStartEvent = {
  type: "generate-text-start";
  metadata: IdMetadata & {
    model: ModelInformation;
    generateTextCallId: string;
    startEpochSeconds: number;
  };
  prompt: unknown;
};

export type GenerateTextEndEvent = {
  type: "generate-text-end";
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
