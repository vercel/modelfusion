import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "../ModelCallEvent.js";

export type SpeechSynthesisStartedEvent = {
  type: "speech-synthesis-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  text: string;
};

export type SpeechSynthesisFinishedEvent = {
  type: "speech-synthesis-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  text: string;
} & (
  | {
      status: "success";
      response: Buffer;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
