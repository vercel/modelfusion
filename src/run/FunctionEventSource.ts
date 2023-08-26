import { ErrorHandler } from "../util/ErrorHandler.js";
import { FunctionEvent } from "./FunctionEvent.js";
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

  notify(event: FunctionEvent) {
    for (const observer of this.observers) {
      try {
        observer.onFunctionEvent(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }
}
