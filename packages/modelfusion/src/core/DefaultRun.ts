import { nanoid as createId } from "nanoid";
import { ErrorHandler } from "../util/ErrorHandler";
import { FunctionEvent } from "./FunctionEvent";
import { FunctionEventSource } from "./FunctionEventSource";
import { FunctionObserver } from "./FunctionObserver";
import { Run } from "./Run";

import { ModelCallFinishedEvent } from "../model-function/ModelCallEvent";

export class DefaultRun implements Run {
  readonly runId: string;
  readonly sessionId?: string;
  readonly userId?: string;

  readonly abortSignal?: AbortSignal;

  readonly errorHandler: ErrorHandler;

  readonly events: FunctionEvent[] = [];

  private functionEventSource: FunctionEventSource;

  constructor({
    runId = `run-${createId()}`,
    sessionId,
    userId,
    abortSignal,
    observers,
    errorHandler,
  }: {
    runId?: string;
    sessionId?: string;
    userId?: string;
    abortSignal?: AbortSignal;
    observers?: FunctionObserver[];
    errorHandler?: ErrorHandler;
  } = {}) {
    this.runId = runId;
    this.sessionId = sessionId;
    this.userId = userId;
    this.abortSignal = abortSignal;

    this.errorHandler = errorHandler ?? ((error) => console.error(error));

    this.functionEventSource = new FunctionEventSource({
      observers: observers ?? [],
      errorHandler: this.errorHandler.bind(this),
    });
  }

  readonly functionObserver = {
    onFunctionEvent: (event: FunctionEvent) => {
      this.events.push(event);
      this.functionEventSource.notify(event);
    },
  };

  getSuccessfulModelCalls() {
    return this.events.filter(
      (
        event
      ): event is ModelCallFinishedEvent & { result: { status: "success" } } =>
        "model" in event &&
        "result" in event &&
        "status" in event.result &&
        event.result.status === "success"
    );
  }
}
