import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TranscriptionStartedEvent extends BaseModelCallStartedEvent {
  functionType: "transcription";
}

export type TranscriptionFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface TranscriptionFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "transcription";
  result: TranscriptionFinishedEventResult;
}
