import {
  FinishedEventMetadata,
  StartedEventMetadata,
} from "../EventMetadata.js";
import { Vector } from "../../run/Vector.js";

export type TextEmbeddingObserver = {
  onTextEmbeddingStarted?: (event: TextEmbeddingStartedEvent) => void;
  onTextEmbeddingFinished?: (event: TextEmbeddingFinishedEvent) => void;
};

export type TextEmbeddingStartedEvent = {
  type: "text-embedding-started";
  metadata: StartedEventMetadata;
  texts: Array<string>;
};

export type TextEmbeddingFinishedEvent = {
  type: "text-embedding-finished";
  metadata: FinishedEventMetadata;
  texts: Array<string>;
} & (
  | {
      status: "success";
      generatedEmbeddings: Array<Vector>;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
