import { Vector } from "../../run/Vector.js";
import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export type TextEmbeddingStartedEvent = BaseModelCallStartedEvent & {
  functionType: "text-embedding";
  settings: unknown;
  texts: Array<string>;
};

export type TextEmbeddingFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "text-embedding";
  settings: unknown;
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
