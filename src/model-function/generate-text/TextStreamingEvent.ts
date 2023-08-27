import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-streaming";
  settings: unknown;
  prompt: unknown;
}

export type TextStreamingFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "text-streaming";
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
