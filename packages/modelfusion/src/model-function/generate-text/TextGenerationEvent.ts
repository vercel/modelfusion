import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "generate-text";
}

export type TextGenerationFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
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
  functionType: "generate-text";
  result: TextGenerationFinishedEventResult;
}

export interface TextStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "stream-text";
}

export interface TextStreamingFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "stream-text";
}
