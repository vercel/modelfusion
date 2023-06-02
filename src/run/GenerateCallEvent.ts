import { IdMetadata } from "./IdMetadata.js";
import { ModelInformation } from "./ModelInformation.js";

export type GenerateCallStartEvent = {
  type: "generate-start";
  input: unknown;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
  };
};

export type GenerateCallEndEvent = {
  type: "generate-end";
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
      extractedOutput: unknown;
      processedOutput: unknown;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
