import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent";

export interface RetrieveStartedEvent extends BaseFunctionStartedEvent {
  functionType: "retrieve";
  query: unknown;
}

export interface RetrieveFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "retrieve";
  query: unknown;
  results: unknown;
}
