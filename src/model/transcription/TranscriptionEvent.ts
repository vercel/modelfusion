import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallEvent.js";

export type TranscriptionStartedEvent = {
  type: "transcription-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  data: unknown;
};

export type TranscriptionFinishedEvent = {
  type: "transcription-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  data: unknown;
} & (
  | {
      status: "success";
      response: unknown;
      transcription: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
