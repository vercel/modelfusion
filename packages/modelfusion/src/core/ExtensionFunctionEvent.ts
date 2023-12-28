import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "./FunctionEvent.js";

export interface ExtensionFunctionStartedEvent
  extends BaseFunctionStartedEvent {
  functionType: "extension";
  extension: string;
  data: unknown;
}

export interface ExtensionFunctionFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "extension";
  extension: string;
  data: unknown;
}
