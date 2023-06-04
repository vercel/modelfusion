import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type GenerateTextStartEvent = {
  type: "generate-text-start";
  input: unknown;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
  };
};

export type GenerateTextEndEvent = {
  type: "generate-text-end";
  input: unknown;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
    durationInMs: number;
  };
} & (
  | {
      status: "success";
      rawOutput: unknown;
      extractedText: string;
      processedOutput: unknown;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
