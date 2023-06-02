import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type EmbedTextStartEvent = {
  type: "embed-text-start";
  texts: Array<string>;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
  };
};

export type EmbedTextEndEvent = {
  type: "embed-text-end";
  texts: Array<string>;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
    durationInMs: number;
  };
} & (
  | {
      status: "success";
      rawOutputs: Array<unknown>;
      embeddings: Array<unknown>;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
