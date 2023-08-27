import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";
import { Tool } from "./Tool.js";

export type ExecuteToolStartedEvent = BaseFunctionStartedEvent & {
  functionType: "execute-tool";
  tool: Tool<string, unknown, unknown>;
  input: unknown;
};

export type ExecuteToolFinishedEvent = BaseFunctionFinishedEvent & {
  functionType: "execute-tool";
  tool: Tool<string, unknown, unknown>;
  input: unknown;
} & (
    | {
        status: "success";
        output: unknown;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
