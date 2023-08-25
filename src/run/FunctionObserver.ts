import {
  FunctionFinishedEvent,
  FunctionStartedEvent,
} from "./FunctionEvent.js";

export type FunctionObserver = {
  onFunctionStarted?: (event: FunctionStartedEvent) => void;
  onFunctionFinished?: (event: FunctionFinishedEvent) => void;
};
