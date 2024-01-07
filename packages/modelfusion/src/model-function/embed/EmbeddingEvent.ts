import { Vector } from "../../core/Vector.js";
import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface EmbeddingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "embed";
  input: unknown | Array<unknown>;
}

export type EmbeddingFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: Vector | Array<Vector>;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface EmbeddingFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "embed";
  input: unknown | Array<unknown>;
  result: EmbeddingFinishedEventResult;
}
