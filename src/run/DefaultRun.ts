import { nanoid as createId } from "nanoid";
import { CostCalculator } from "../cost/CostCalculator.js";
import { calculateCost } from "../cost/calculateCost.js";
import {
  SuccessfulModelCall,
  extractSuccessfulModelCalls,
} from "../model-function/SuccessfulModelCall.js";
import { Run } from "./Run.js";
import { RunFunctionEvent } from "./RunFunctionEvent.js";
import { RunFunctionObserver } from "./RunFunctionObserver.js";

export class DefaultRun implements Run {
  readonly runId: string;
  readonly sessionId?: string;
  readonly userId?: string;

  readonly abortSignal?: AbortSignal;
  readonly costCalculators: CostCalculator[];

  readonly events: RunFunctionEvent[] = [];

  readonly observers?: RunFunctionObserver[];

  constructor({
    runId = createId(),
    sessionId,
    userId,
    abortSignal,
    observers,
    costCalculators = [],
  }: {
    runId?: string;
    sessionId?: string;
    userId?: string;
    abortSignal?: AbortSignal;
    observers?: RunFunctionObserver[];
    costCalculators?: CostCalculator[];
  } = {}) {
    this.runId = runId;
    this.sessionId = sessionId;
    this.userId = userId;
    this.abortSignal = abortSignal;
    this.costCalculators = costCalculators;

    this.observers = [
      {
        onRunFunctionStarted: (event) => {
          this.events.push(event);
        },
        onRunFunctionFinished: (event) => {
          this.events.push(event);
        },
      },
      ...(observers ?? []),
    ];
  }

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
