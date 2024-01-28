import { Vector } from "../../core/Vector";
import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent";

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
