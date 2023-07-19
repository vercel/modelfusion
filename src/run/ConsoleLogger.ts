import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "../model-function/ModelCallEvent.js";
import { ModelCallObserver } from "../model-function/ModelCallObserver.js";

export class ConsoleLogger implements ModelCallObserver {
  onModelCallStarted(event: ModelCallStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onModelCallFinished(event: ModelCallFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
