import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface StructureGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-structure" | "generate-structure-or-text";
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
  functionType: "generate-structure" | "generate-structure-or-text";
  result: StructureGenerationFinishedEventResult;
};
