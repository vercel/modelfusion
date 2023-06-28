import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallObserver.js";
import { Vector } from "../../run/Vector.js";

export type TextEmbeddingStartedEvent = {
  type: "text-embedding-started";
  metadata: ModelCallStartedEventMetadata;
  texts: Array<string>;
};

export type TextEmbeddingFinishedEvent = {
  type: "text-embedding-finished";
  metadata: ModelCallFinishedEventMetadata;
  texts: Array<string>;
} & (
  | {
      status: "success";
      generatedEmbeddings: Array<Vector>;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
