import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "./FunctionEvent.js";

export interface ExecuteFunctionStartedEvent extends BaseFunctionStartedEvent {
  functionType: "execute-function";
}

export interface ExecuteFunctionFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "execute-function";
}
