import {
  GenerateCallEndEvent,
  GenerateCallStartEvent,
} from "./GenerateCallEvent.js";

export type RunContext =
  | {
      recordCallStart?: (call: GenerateCallStartEvent) => void;
      recordCallEnd?: (call: GenerateCallEndEvent) => void;
    }
  | undefined;
