import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Tool } from "../Tool.js";
import { ToolCall } from "../ToolCall.js";
import { ToolCallError } from "../ToolCallError.js";
import { ToolCallResult } from "../ToolCallResult.js";
import { ToolExecutionError } from "../ToolExecutionError.js";
import { executeTool } from "./executeTool.js";

export async function safeExecuteToolCall<
  TOOL extends Tool<string, unknown, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  tool: TOOL,
  toolCall: ToolCall<TOOL["name"], TOOL["parameters"]>,
  options?: FunctionOptions
): Promise<
  ToolCallResult<
    TOOL["name"],
    TOOL["parameters"],
    Awaited<ReturnType<TOOL["execute"]>>
  >
> {
  try {
    return {
      tool: toolCall.name,
      toolCall,
      args: toolCall.args,
      ok: true,
      result: await executeTool({ tool, args: toolCall.args, ...options }),
    };
  } catch (error) {
    // If the error is an AbortError, rethrow it.
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      tool: toolCall.name,
      toolCall,
      args: toolCall.args,
      ok: false,
      result: new ToolCallError({
        toolCall,
        cause: error instanceof ToolExecutionError ? error.cause : error,
      }),
    };
  }
}
