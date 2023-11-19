import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent.js";

export interface ExecuteToolStartedEvent extends BaseFunctionStartedEvent {
  functionType: "execute-tool";
  toolName: string;
  input: unknown;
}

export interface ExecuteToolFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "execute-tool";
  toolName: string;
  input: unknown;
}
