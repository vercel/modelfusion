import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type GenerateImageStartEvent = {
  type: "generate-image-start";
  input: unknown;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
  };
};

export type GenerateImageEndEvent = {
  type: "generate-image-end";
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
      generatedBase64Image: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
