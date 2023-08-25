import { ErrorHandler } from "../util/ErrorHandler.js";
import {
  FunctionFinishedEvent,
  FunctionStartedEvent,
} from "./FunctionEvent.js";
import { FunctionObserver } from "./FunctionObserver.js";

export class FunctionEventSource {
  readonly observers: FunctionObserver[];
  readonly errorHandler: ErrorHandler;

  constructor({
    observers,
    errorHandler,
  }: {
    observers: FunctionObserver[];
    errorHandler?: ErrorHandler;
  }) {
    this.observers = observers;
    this.errorHandler = errorHandler ?? ((error) => console.error(error));
  }

  notifyFunctionStarted(event: FunctionStartedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onFunctionStarted?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }

  notifyFunctionFinished(event: FunctionFinishedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onFunctionFinished?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }
}
