import {
  ExecuteToolFinishedEvent,
  ExecuteToolStartedEvent,
} from "../tool/ExecuteToolEvent.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";

export type IdMetadata = {
  /**
   * Unique identifier for the function call.
   */
  callId?: string | undefined;

  /**
   * Optional unique identifier for the function.
   */
  functionId?: string | undefined;

  /**
   * Unique identifier for the run.
   * Only available if the function is part of a run.
   */
  runId?: string | undefined;

  /**
   * Unique identifier for the session.
   * Only available if the function is part of a run with a session.
   */
  sessionId?: string | undefined;

  /**
   * Unique identifier for the user.
   * Only available if the function is part of a run with a user.
   */
  userId?: string | undefined;
};

export type RunFunctionStartedEventMetadata = IdMetadata & {
  startEpochSeconds: number;
};

export type RunFunctionFinishedEventMetadata =
  RunFunctionStartedEventMetadata & {
    durationInMs: number;
  };

export type RunFunctionStartedEvent =
  | ModelCallStartedEvent
  | ExecuteToolStartedEvent;

export type RunFunctionFinishedEvent =
  | ModelCallFinishedEvent
  | ExecuteToolFinishedEvent;

export type RunFunctionEvent =
  | RunFunctionStartedEvent
  | RunFunctionFinishedEvent;
