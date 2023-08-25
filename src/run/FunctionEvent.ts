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

export type FunctionStartedEventMetadata = IdMetadata & {
  startTimestamp: Date;
};

export type FunctionFinishedEventMetadata = FunctionStartedEventMetadata & {
  finishTimestamp: Date;
  durationInMs: number;
};

export type FunctionStartedEvent =
  | ModelCallStartedEvent
  | ExecuteToolStartedEvent;

export type FunctionFinishedEvent =
  | ModelCallFinishedEvent
  | ExecuteToolFinishedEvent;

export type FunctionEvent = FunctionStartedEvent | FunctionFinishedEvent;
