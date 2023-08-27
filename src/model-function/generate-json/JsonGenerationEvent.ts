import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface JsonGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "json-generation" | "json-or-text-generation";
  prompt: unknown;
}

export type JsonGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "json-generation" | "json-or-text-generation";
  prompt: unknown;
} & (
    | {
        status: "success";
        response: unknown;
        generatedJson: unknown;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
