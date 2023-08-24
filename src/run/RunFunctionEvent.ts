import {
  ExecuteToolFinishedEvent,
  ExecuteToolStartedEvent,
} from "../tool/ExecuteToolEvent.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";
import { IdMetadata } from "./IdMetadata.js";

export type RunFunctionEvent =
  | RunFunctionStartedEvent
  | RunFunctionFinishedEvent;

export type RunFunctionStartedEventMetadata = IdMetadata & {
  startEpochSeconds: number;
};

export type RunFunctionStartedEvent =
  | ModelCallStartedEvent
  | ExecuteToolStartedEvent;

export type RunFunctionFinishedEventMetadata =
  RunFunctionStartedEventMetadata & {
    durationInMs: number;
  };

export type RunFunctionFinishedEvent =
  | ModelCallFinishedEvent
  | ExecuteToolFinishedEvent;
