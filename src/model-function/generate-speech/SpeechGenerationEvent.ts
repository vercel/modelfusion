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

export interface SpeechStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "speech-streaming";
}

export interface SpeechStreamingFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "speech-streaming";
}
