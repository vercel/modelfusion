import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-generation";
}

export type TextGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: string;

      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface TextGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "text-generation";
  result: TextGenerationFinishedEventResult;
}
