import { IdMetadata } from "../../run/IdMetadata.js";
import { ModelInformation } from "../../run/ModelInformation.js";

export type TranscriptionObserver = {
  onTranscriptionStarted?: (event: TranscriptionStartedEvent) => void;
  onTranscriptionFinished?: (event: TranscriptionFinishedEvent) => void;
};

export type TranscriptionStartedEvent = {
  type: "transcription-started";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
  };
  data: unknown;
};

export type TranscriptionFinishedEvent = {
  type: "transcription-finished";
  metadata: IdMetadata & {
    model: ModelInformation;
    startEpochSeconds: number;
    durationInMs: number;
  };
  data: unknown;
} & (
  | {
      status: "success";
      transcription: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
