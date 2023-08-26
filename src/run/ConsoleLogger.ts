import { FunctionEvent } from "./FunctionEvent.js";
import { FunctionObserver } from "./FunctionObserver.js";

export class ConsoleLogger implements FunctionObserver {
  onFunctionEvent(event: FunctionEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
