import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-generation";
  prompt: unknown;
}

export type TextGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface TextGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "text-generation";
  prompt: unknown;
  result: TextGenerationFinishedEventResult;
}
