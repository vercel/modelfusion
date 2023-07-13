import { Vector } from "../../run/Vector.js";
import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "../ModelCallEvent.js";

export type TextEmbeddingStartedEvent = {
  type: "text-embedding-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  texts: Array<string>;
};

export type TextEmbeddingFinishedEvent = {
  type: "text-embedding-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  texts: Array<string>;
} & (
  | {
      status: "success";
      response: unknown;
      generatedEmbeddings: Array<Vector>;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
