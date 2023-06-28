import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallObserver.js";

export type TranscriptionStartedEvent = {
  type: "transcription-started";
  metadata: ModelCallStartedEventMetadata;
  data: unknown;
};

export type TranscriptionFinishedEvent = {
  type: "transcription-finished";
  metadata: ModelCallFinishedEventMetadata;
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
