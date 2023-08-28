import { Vector } from "../../core/Vector.js";
import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextEmbeddingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-embedding";
  input: string | Array<string>;
}

export type TextEmbeddingFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: Vector | Array<Vector>;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface TextEmbeddingFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "text-embedding";
  input: string | Array<string>;
  result: TextEmbeddingFinishedEventResult;
}
