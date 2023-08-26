import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export type TranscriptionStartedEvent = BaseModelCallStartedEvent & {
  functionType: "transcription";
  settings: unknown;
  data: unknown;
};

export type TranscriptionFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "transcription";
  settings: unknown;
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
