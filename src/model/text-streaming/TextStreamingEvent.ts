import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallEvent.js";

export type TextStreamingStartedEvent = {
  type: "text-streaming-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  prompt: unknown;
};

export type TextStreamingFinishedEvent = {
  type: "text-streaming-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  prompt: unknown;
} & (
  | {
      status: "success";
      response: unknown;
      generatedText: string;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
