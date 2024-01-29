import { ToolCall } from "./ToolCall";
import { ToolCallError } from "./ToolCallError";

export type ToolCallResult<NAME extends string, PARAMETERS, RETURN_TYPE> = {
  tool: NAME;
  toolCall: ToolCall<NAME, PARAMETERS>;
  args: PARAMETERS;
} & ({ ok: true; result: RETURN_TYPE } | { ok: false; result: ToolCallError });
