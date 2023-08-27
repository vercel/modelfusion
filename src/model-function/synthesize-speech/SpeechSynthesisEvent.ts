import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface SpeechSynthesisStartedEvent extends BaseModelCallStartedEvent {
  functionType: "speech-synthesis";
  text: string;
}

export type SpeechSynthesisFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "speech-synthesis";
  text: string;
} & (
    | {
        status: "success";
        response: Buffer;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
