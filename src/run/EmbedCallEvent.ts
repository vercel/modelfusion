import { IdMetadata } from "./IdMetadata.js";

export type EmbedCallStartEvent = {
  type: "embed-start";
  input: unknown;
  metadata: IdMetadata & {
    model: {
      vendor: string;
      name: string;
    };

    startEpochSeconds: number;
  };
};

export type EmbedCallEndEvent = {
  type: "embed-end";
  input: unknown;
  metadata: IdMetadata & {
    model: {
      vendor: string;
      name: string;
    };

    startEpochSeconds: number;
    durationInMs: number;
  };
} & (
  | { status: "success"; rawOutput: unknown; embedding: unknown }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
