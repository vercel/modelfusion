import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent";

export interface ObjectGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-object";
}

export type ObjectGenerationFinishedEventResult =
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

export type ObjectGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "generate-object";
  result: ObjectGenerationFinishedEventResult;
};
