import { IdMetadata } from "./IdMetadata.js";

export type EmbedCallStartEvent = {
  type: "embed-start";
  texts: Array<string>;
  metadata: IdMetadata & {
    model: {
      provider: string;
      name: string;
    };

    startEpochSeconds: number;
  };
};

export type EmbedCallEndEvent = {
  type: "embed-end";
  texts: Array<string>;
  metadata: IdMetadata & {
    model: {
      provider: string;
      name: string;
    };

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
