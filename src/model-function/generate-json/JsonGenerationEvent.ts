import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface JsonGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "json-generation" | "json-or-text-generation";
}

export type JsonGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: unknown;

      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export type JsonGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "json-generation" | "json-or-text-generation";
  result: JsonGenerationFinishedEventResult;
};
