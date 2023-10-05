import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface SpeechSynthesisStartedEvent extends BaseModelCallStartedEvent {
  functionType: "speech-synthesis";
  input: string;
}

export type SpeechSynthesisFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      value: Buffer;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface SpeechSynthesisFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "speech-synthesis";
  input: string;
  result: SpeechSynthesisFinishedEventResult;
}
