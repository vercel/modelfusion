import { FunctionOptions } from "./FunctionOptions.js";
import { FunctionEvent } from "./FunctionEvent.js";
import { FunctionObserver } from "./FunctionObserver.js";

export function getFunctionCallLogger(
  logging: FunctionOptions["logging"]
): Array<FunctionObserver> {
  switch (logging) {
    case "basic-text":
      return [basicTextObserver];

    case "detailed-object":
      return [detailedObjectObserver];

    case "detailed-json":
      return [detailedJsonObserver];

    case "off":
    default:
      return [];
  }
}

const basicTextObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    const text = `[${event.timestamp.toISOString()}] ${event.callId}${
      event.functionId != null ? ` (${event.functionId})` : ""
    } - ${event.functionType} ${event.eventType}`;

    // log based on event type:
    switch (event.eventType) {
      case "started": {
        console.log(text);
        break;
      }
      case "finished": {
        console.log(`${text} in ${event.durationInMs}ms`);
        break;
      }
    }
  },
};

const detailedObjectObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    // Remove the "response" property from the result (if any):
    if (
      event.eventType === "finished" &&
      event.result != null &&
      "response" in event.result &&
      event.result?.response != null
    ) {
      event = {
        ...event,
        result: Object.fromEntries(
          Object.entries(event.result).filter(([k]) => k !== "response")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
      };
    }

    // filter all undefined properties from event for cleaner console output:
    event = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(event).filter(([_, v]) => v !== undefined)
    ) as FunctionEvent;

    console.log(event);
  },
};

const detailedJsonObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    // Remove the "response" property from the result (if any):
    if (
      event.eventType === "finished" &&
      event.result != null &&
      "response" in event.result &&
      event.result?.response != null
    ) {
      event = {
        ...event,
        result: Object.fromEntries(
          Object.entries(event.result).filter(([k]) => k !== "response")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
      };
    }

    // filter all undefined properties from event for cleaner console output:
    event = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(event).filter(([_, v]) => v !== undefined)
    ) as FunctionEvent;

    console.log(JSON.stringify(event));
  },
};
