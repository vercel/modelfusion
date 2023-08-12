import {
  RunFunctionFinishedEvent,
  RunFunctionStartedEvent,
} from "./RunFunctionEvent.js";

export type RunFunctionObserver = {
  onRunFunctionStarted?: (event: RunFunctionStartedEvent) => void;
  onRunFunctionFinished?: (event: RunFunctionFinishedEvent) => void;
};
