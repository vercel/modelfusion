import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface SpeechGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "speech-generation";
  input: string;
}

export type SpeechGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      value: Buffer;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface SpeechGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "speech-generation";
  input: string;
  result: SpeechGenerationFinishedEventResult;
}
