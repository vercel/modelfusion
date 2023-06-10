import { Vector } from "../../run/Vector.js";
import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type TextEmbeddingObserver = {
  onTextEmbeddingStarted?: (event: TextEmbeddingStartedEvent) => void;
  onTextEmbeddingFinished?: (event: TextEmbeddingFinishedEvent) => void;
};

export type TextEmbeddingStartedEvent = {
  type: "text-embedding-started";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
  };
  texts: Array<string>;
};

export type TextEmbeddingFinishedEvent = {
  type: "text-embedding-finished";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
    durationInMs: number;
  };
  texts: Array<string>;
} & (
  | {
      status: "success";
      generatedEmbeddings: Array<Vector>;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
