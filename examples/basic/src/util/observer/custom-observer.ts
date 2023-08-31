import { FunctionEvent, FunctionObserver } from "modelfusion";

export const customObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    // filter all undefined properties from event for cleaner console output:
    event = Object.fromEntries(
      Object.entries(event).filter(([_, v]) => v !== undefined)
    ) as FunctionEvent;

    // log based on event type:
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
