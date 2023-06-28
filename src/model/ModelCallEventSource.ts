import { ErrorHandler } from "../util/ErrorHandler.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelCallObserver } from "./ModelCallObserver.js";

export class ModelCallEventSource {
  readonly observers: ModelCallObserver[];
  readonly errorHandler: ErrorHandler;

  constructor({
    observers,
    errorHandler,
  }: {
    observers: ModelCallObserver[];
    errorHandler: ErrorHandler;
  }) {
    this.observers = observers;
    this.errorHandler = errorHandler;
  }

  notifyModelCallStarted(event: ModelCallStartedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onModelCallStarted?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }

  notifyModelCallFinished(event: ModelCallFinishedEvent) {
    for (const observer of this.observers) {
      try {
        observer.onModelCallFinished?.(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }
}
