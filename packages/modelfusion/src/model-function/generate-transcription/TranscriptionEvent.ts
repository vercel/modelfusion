import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TranscriptionStartedEvent extends BaseModelCallStartedEvent {
  functionType: "generate-transcription";
}

export type TranscriptionFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface TranscriptionFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "generate-transcription";
  result: TranscriptionFinishedEventResult;
}
