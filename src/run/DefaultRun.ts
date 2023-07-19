import { nanoid as createId } from "nanoid";
import {
  SuccessfulModelCall,
  extractSuccessfulModelCalls,
} from "../model-function/SuccessfulModelCall.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";
import { ModelCallObserver } from "../model-function/ModelCallObserver.js";
import { Run } from "./Run.js";
import { CostCalculator } from "../cost/CostCalculator.js";
import { calculateCost } from "../cost/calculateCost.js";
export class DefaultRun implements Run {
  readonly runId: string;
  readonly sessionId?: string;
  readonly userId?: string;

  readonly abortSignal?: AbortSignal;
  readonly costCalculators: CostCalculator[];

  readonly modelCallEvents: (ModelCallFinishedEvent | ModelCallStartedEvent)[] =
    [];

  readonly observers?: ModelCallObserver[];

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
    observers?: ModelCallObserver[];
    costCalculators?: CostCalculator[];
  } = {}) {
    this.runId = runId;
    this.sessionId = sessionId;
    this.userId = userId;
    this.abortSignal = abortSignal;
    this.costCalculators = costCalculators;

    this.observers = [
      {
        onModelCallStarted: (event) => {
          this.modelCallEvents.push(event);
        },
        onModelCallFinished: (event) => {
          this.modelCallEvents.push(event);
        },
      },
      ...(observers ?? []),
    ];
  }

  get successfulModelCalls(): Array<SuccessfulModelCall> {
    return extractSuccessfulModelCalls(this.modelCallEvents);
  }

  calculateCost() {
    return calculateCost({
      calls: this.successfulModelCalls,
      costCalculators: this.costCalculators,
    });
  }
}
