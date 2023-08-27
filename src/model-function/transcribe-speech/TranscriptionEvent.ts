import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TranscriptionStartedEvent extends BaseModelCallStartedEvent {
  functionType: "transcription";
  data: unknown;
}

export type TranscriptionFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "transcription";
  data: unknown;
} & (
    | {
        status: "success";
        response: unknown;
        transcription: string;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
