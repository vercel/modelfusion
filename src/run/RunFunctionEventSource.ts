import { ErrorHandler } from "../util/ErrorHandler.js";
import {
  RunFunctionFinishedEvent,
  RunFunctionStartedEvent,
} from "./RunFunctionEvent.js";
import { RunFunctionObserver } from "./RunFunctionObserver.js";

export class RunFunctionEventSource {
  readonly observers: RunFunctionObserver[];
  readonly errorHandler: ErrorHandler;

  constructor({
    observers,
    errorHandler,
  }: {
    observers: RunFunctionObserver[];
    errorHandler?: ErrorHandler;
  }) {
    this.observers = observers;
    this.errorHandler = errorHandler ?? ((error) => console.error(error));
  }

  notifyRunFunctionStarted(event: RunFunctionStartedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onRunFunctionStarted?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }

  notifyRunFunctionFinished(event: RunFunctionFinishedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onRunFunctionFinished?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }
}
