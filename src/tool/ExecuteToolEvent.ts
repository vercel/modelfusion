import {
  RunFunctionFinishedEventMetadata,
  RunFunctionStartedEventMetadata,
} from "../run/RunFunctionEvent.js";
import { Tool } from "./Tool.js";

export type ExecuteToolStartedEvent = {
  type: "execute-tool-started";
  metadata: RunFunctionStartedEventMetadata;
  tool: Tool<string, unknown, unknown>;
  input: unknown;
};

export type ExecuteToolFinishedEvent = {
  type: "execute-tool-finished";
  metadata: RunFunctionFinishedEventMetadata;
  tool: Tool<string, unknown, unknown>;
  input: unknown;
} & (
  | {
      status: "success";
      output: unknown;
    }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
