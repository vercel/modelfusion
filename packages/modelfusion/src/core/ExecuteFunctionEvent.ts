import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "./FunctionEvent";

export interface ExecuteFunctionStartedEvent extends BaseFunctionStartedEvent {
  functionType: "execute-function";
}

export interface ExecuteFunctionFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "execute-function";
}
