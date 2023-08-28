import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface SpeechSynthesisStartedEvent extends BaseModelCallStartedEvent {
  functionType: "speech-synthesis";
  text: string;
}

export type SpeechSynthesisFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: Buffer;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface SpeechSynthesisFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "speech-synthesis";
  text: string;
  result: SpeechSynthesisFinishedEventResult;
}
