import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface StructureGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-structure";
}

export type StructureGenerationFinishedEventResult =
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

export type StructureGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "generate-structure";
  result: StructureGenerationFinishedEventResult;
};
