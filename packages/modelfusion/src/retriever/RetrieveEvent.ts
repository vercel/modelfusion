import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";

export interface RetrieveStartedEvent extends BaseFunctionStartedEvent {
  functionType: "retrieve";
  query: unknown;
}

export interface RetrieveFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "retrieve";
  query: unknown;
  results: unknown;
}
