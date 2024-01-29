import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent";

export interface ClassifyStartedEvent extends BaseModelCallStartedEvent {
  functionType: "classify";
  input: unknown | Array<unknown>;
}

export type ClassifyFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: unknown;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface ClassifyFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "classify";
  input: unknown;
  result: ClassifyFinishedEventResult;
}
