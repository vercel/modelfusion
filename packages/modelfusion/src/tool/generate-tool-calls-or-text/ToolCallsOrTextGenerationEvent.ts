import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../../model-function/ModelCallEvent.js";

export interface ToolCallsOrTextGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-tool-calls-or-text";
}

export type ToolCallsOrTextGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      value: unknown;

      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export type ToolCallsOrTextGenerationFinishedEvent =
  BaseModelCallFinishedEvent & {
    functionType: "generate-tool-calls-or-text";
    result: ToolCallsOrTextGenerationFinishedEventResult;
  };
