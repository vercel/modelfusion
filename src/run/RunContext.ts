import { EmbedCall } from "./EmbedCall.js";
import { GenerateCall } from "./GenerateCall.js";

export type RunContext = {
  recordCall: null | ((call: GenerateCall | EmbedCall) => void);
} | null;
