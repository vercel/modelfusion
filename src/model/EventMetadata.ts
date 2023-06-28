import { IdMetadata } from "../run/IdMetadata.js";
import { ModelInformation } from "../run/ModelInformation.js";

export type StartedEventMetadata = IdMetadata & {
  model: ModelInformation;
  startEpochSeconds: number;
};

export type FinishedEventMetadata = StartedEventMetadata & {
  durationInMs: number;
};
