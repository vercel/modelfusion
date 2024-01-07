import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../../model-function/ModelCallEvent.js";

export interface ToolCallsGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-tool-calls";
}

export type ToolCallsGenerationFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: unknown;

      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export type ToolCallsGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "generate-tool-calls";
  result: ToolCallsGenerationFinishedEventResult;
};
