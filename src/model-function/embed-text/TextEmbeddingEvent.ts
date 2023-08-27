import { Vector } from "../../core/Vector.js";
import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextEmbeddingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-embedding";
  texts: Array<string>;
}

export type TextEmbeddingFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "text-embedding";
  texts: Array<string>;
} & (
    | {
        status: "success";
        response: unknown;
        generatedEmbeddings: Array<Vector>;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
