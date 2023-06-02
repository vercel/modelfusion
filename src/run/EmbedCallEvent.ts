import { IdMetadata } from "./IdMetadata.js";
import { ModelInformation } from "./ModelInformation.js";

export type EmbedCallStartEvent = {
  type: "embed-start";
  texts: Array<string>;
  metadata: IdMetadata & {
    model: ModelInformation;

    startEpochSeconds: number;
  };
};

export type EmbedCallEndEvent = {
  type: "embed-end";
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
