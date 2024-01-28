import { FunctionOptions } from "../../core/FunctionOptions";
import { Tool } from "../Tool";
import { ToolCall } from "../ToolCall";
import { ToolCallError } from "../ToolCallError";
import { ToolCallResult } from "../ToolCallResult";
import { ToolExecutionError } from "../ToolExecutionError";
import { executeTool } from "./executeTool";

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
