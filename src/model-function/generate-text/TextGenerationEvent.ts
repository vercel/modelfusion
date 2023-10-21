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
      value: string;

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

export interface TextStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-streaming";
}

export interface TextStreamingFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "text-streaming";
}
