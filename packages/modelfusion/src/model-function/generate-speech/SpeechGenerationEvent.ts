import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface SpeechGenerationStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "generate-speech";
  input: string;
}

export type SpeechGenerationFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: Buffer;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface SpeechGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "generate-speech";
  input: string;
  result: SpeechGenerationFinishedEventResult;
}

export interface SpeechStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "stream-speech";
}

export interface SpeechStreamingFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "stream-speech";
}
