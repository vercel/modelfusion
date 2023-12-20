import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";

export interface GuardStartedEvent extends BaseFunctionStartedEvent {
  functionType: "guard";
}

export interface GuardFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "guard";
}
