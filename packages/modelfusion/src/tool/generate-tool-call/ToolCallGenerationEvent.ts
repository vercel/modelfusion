import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../../model-function/ModelCallEvent.js";

export interface ToolCallGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-tool-call";
}

export type ToolCallGenerationFinishedEventResult =
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

export type ToolCallGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "generate-tool-call";
  result: ToolCallGenerationFinishedEventResult;
};
