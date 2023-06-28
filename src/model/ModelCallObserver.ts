import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";

export type ModelCallObserver = {
  onModelCallStarted?: (event: ModelCallStartedEvent) => void;
  onModelCallFinished?: (event: ModelCallFinishedEvent) => void;
};
