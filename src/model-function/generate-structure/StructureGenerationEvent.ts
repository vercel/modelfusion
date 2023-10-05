import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface StructureGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "structure-generation" | "structure-or-text-generation";
}

export type StructureGenerationFinishedEventResult =
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

export type StructureGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "structure-generation" | "structure-or-text-generation";
  result: StructureGenerationFinishedEventResult;
};
