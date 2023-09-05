import { nanoid as createId } from "nanoid";
import { CostCalculator } from "../cost/CostCalculator.js";
import { calculateCost } from "../cost/calculateCost.js";
import {
  SuccessfulModelCall,
  extractSuccessfulModelCalls,
} from "../model-function/SuccessfulModelCall.js";
import { ErrorHandler } from "../util/ErrorHandler.js";
import { FunctionEvent } from "./FunctionEvent.js";
import { FunctionEventSource } from "./FunctionEventSource.js";
import { FunctionObserver } from "./FunctionObserver.js";
import { Run } from "./Run.js";

export class DefaultRun implements Run {
  readonly runId: string;
  readonly sessionId?: string;
  readonly userId?: string;

  readonly abortSignal?: AbortSignal;
  readonly costCalculators: CostCalculator[];

  readonly errorHandler: ErrorHandler;

  readonly events: FunctionEvent[] = [];

  private functionEventSource: FunctionEventSource;

  constructor({
    runId = `run-${createId()}`,
    sessionId,
    userId,
    abortSignal,
    observers,
    costCalculators = [],
    errorHandler,
  }: {
    runId?: string;
    sessionId?: string;
    userId?: string;
    abortSignal?: AbortSignal;
    observers?: FunctionObserver[];
    costCalculators?: CostCalculator[];
    errorHandler?: ErrorHandler;
  } = {}) {
    this.runId = runId;
    this.sessionId = sessionId;
    this.userId = userId;
    this.abortSignal = abortSignal;
    this.costCalculators = costCalculators;

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

  get successfulModelCalls(): Array<SuccessfulModelCall> {
    return extractSuccessfulModelCalls(this.events);
  }

  calculateCost() {
    return calculateCost({
      calls: this.successfulModelCalls,
      costCalculators: this.costCalculators,
    });
  }
}
