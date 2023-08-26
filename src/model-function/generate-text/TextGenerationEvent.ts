import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export type TextGenerationStartedEvent = BaseModelCallStartedEvent & {
  functionType: "text-generation";
  settings: unknown;
  prompt: unknown;
};

export type TextGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "text-generation";
  settings: unknown;
  prompt: unknown;
} & (
    | {
        status: "success";
        response: unknown;
        generatedText: string;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
