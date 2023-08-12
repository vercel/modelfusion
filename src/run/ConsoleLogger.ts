import {
  RunFunctionFinishedEvent,
  RunFunctionStartedEvent,
} from "./RunFunctionEvent.js";
import { RunFunctionObserver } from "./RunFunctionObserver.js";

export class ConsoleLogger implements RunFunctionObserver {
  onRunFunctionStarted(event: RunFunctionStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onRunFunctionFinished(event: RunFunctionFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
