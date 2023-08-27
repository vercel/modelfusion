import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";
import { Tool } from "./Tool.js";

export interface ExecuteToolStartedEvent extends BaseFunctionStartedEvent {
  functionType: "execute-tool";
  tool: Tool<string, unknown, unknown>;
  input: unknown;
}

export type ExecuteToolFinishedEventResult =
  | {
      status: "success";
      output: unknown;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface ExecuteToolFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "execute-tool";
  tool: Tool<string, unknown, unknown>;
  input: unknown;
  result: ExecuteToolFinishedEventResult;
}
