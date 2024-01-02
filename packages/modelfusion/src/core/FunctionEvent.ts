import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";
import {
  RetrieveFinishedEvent,
  RetrieveStartedEvent,
} from "../retriever/RetrieveEvent.js";
import {
  ExecuteToolFinishedEvent,
  ExecuteToolStartedEvent,
} from "../tool/execute-tool/ExecuteToolEvent.js";
import {
  UseToolFinishedEvent,
  UseToolStartedEvent,
} from "../tool/use-tool/UseToolEvent.js";
import {
  useToolsFinishedEvent,
  useToolsStartedEvent,
} from "../tool/use-tools/UseToolsEvent.js";
import {
  UpsertIntoVectorIndexFinishedEvent,
  UpsertIntoVectorIndexStartedEvent,
} from "../vector-index/UpsertIntoVectorIndexEvent.js";
import {
  ExecuteFunctionFinishedEvent,
  ExecuteFunctionStartedEvent,
} from "./ExecuteFunctionEvent.js";
import {
  ExtensionFunctionFinishedEvent,
  ExtensionFunctionStartedEvent,
} from "./ExtensionFunctionEvent.js";

export interface BaseFunctionEvent {
  /**
   * Unique identifier for the function call.
   */
  callId: string | undefined;

  /**
   * Unique identifier of the call id of the parent function.
   */
  parentCallId?: string | undefined;

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
      value: unknown;
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
  | ExecuteFunctionStartedEvent
  | ExecuteFunctionFinishedEvent
  | ExecuteToolStartedEvent
  | ExecuteToolFinishedEvent
  | ExtensionFunctionStartedEvent
  | ExtensionFunctionFinishedEvent
  | ModelCallStartedEvent
  | ModelCallFinishedEvent
  | RetrieveStartedEvent
  | RetrieveFinishedEvent
  | UpsertIntoVectorIndexStartedEvent
  | UpsertIntoVectorIndexFinishedEvent
  | UseToolStartedEvent
  | UseToolFinishedEvent
  | useToolsStartedEvent
  | useToolsFinishedEvent;
