import {
  ModelCallFinishedEventMetadata,
  ModelCallStartedEventMetadata,
} from "model/ModelCallEvent.js";
import { JsonGenerationSchema } from "./JsonGenerationModel.js";

export type JsonGenerationStartedEvent = {
  type: "json-generation-started";
  metadata: ModelCallStartedEventMetadata;
  settings: unknown;
  prompt: unknown;
  schema: JsonGenerationSchema<unknown>;
};

export type JsonGenerationFinishedEvent = {
  type: "json-generation-finished";
  metadata: ModelCallFinishedEventMetadata;
  settings: unknown;
  prompt: unknown;
  schema: JsonGenerationSchema<unknown>;
} & (
  | {
      status: "success";
      response: unknown;
      generatedJson: unknown;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
