import {
  ExecuteToolFinishedEvent,
  ExecuteToolStartedEvent,
} from "../tool/ExecuteToolEvent.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";

export interface BaseFunctionEvent {
  /**
   * Unique identifier for the function call.
   */
  callId: string | undefined;

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

  /**
   * Timestamp of the event.
   */
  timestamp: Date;

  /**
   * Type of the event. Defined in the subclasses.
   */
  eventType: "started" | "finished";

  /**
   * Type of the function. Defined in the subclasses.
   */
  functionType: string;
}

export interface BaseFunctionStartedEvent extends BaseFunctionEvent {
  eventType: "started";

  /**
   * Timestamp when the function call started.
   */
  startTimestamp: Date;
}

export type BaseFunctionFinishedEventResult =
  | {
      status: "success";
      output: unknown;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface BaseFunctionFinishedEvent extends BaseFunctionEvent {
  eventType: "finished";

  /**
   * Timestamp when the function call started.
   */
  startTimestamp: Date;

  /**
   * Timestamp when the function call finished.
   */
  finishTimestamp: Date;

  /**
   * Duration of the function call in milliseconds.
   */
  durationInMs: number;

  /**
   * Result of the function call.
   */
  result: BaseFunctionFinishedEventResult;
}

export type FunctionEvent =
  | ModelCallStartedEvent
  | ExecuteToolStartedEvent
  | ModelCallFinishedEvent
  | ExecuteToolFinishedEvent;
