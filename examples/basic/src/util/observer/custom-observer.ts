import { FunctionEvent, FunctionObserver } from "modelfusion";

export const customObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    switch (event.eventType) {
      case "started": {
        console.log(
          `[${event.timestamp.toISOString()}] ${event.callId} - ${
            event.functionType
          } ${event.eventType}`
        );
        break;
      }
      case "finished": {
        console.log(
          `[${event.timestamp.toISOString()}] ${event.callId} - ${
            event.functionType
          } ${event.eventType} in ${event.durationInMs}ms`
        );
        break;
      }
    }
    console.log(event);
    console.log();
  },
};
