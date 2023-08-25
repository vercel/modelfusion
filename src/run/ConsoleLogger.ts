import {
  FunctionFinishedEvent,
  FunctionStartedEvent,
} from "./FunctionEvent.js";
import { FunctionObserver } from "./FunctionObserver.js";

export class ConsoleLogger implements FunctionObserver {
  onFunctionStarted(event: FunctionStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onFunctionFinished(event: FunctionFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
