import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeFunctionCall } from "../../core/executeFunctionCall.js";
import { Tool } from "../Tool.js";
import { ToolResult } from "../ToolResult.js";
import { executeTool } from "../execute-tool/executeTool.js";
import {
  ToolCallGenerationModel,
  ToolCallGenerationModelSettings,
} from "../generate-tool-call/ToolCallGenerationModel.js";
import { generateToolCall } from "../generate-tool-call/generateToolCall.js";

/**
 * `useTool` uses `generateToolCall` to generate parameters for a tool and
 * then executes the tool with the parameters using `executeTool`.
 *
 * @returns The result contains the name of the tool (`tool` property),
 * the parameters (`parameters` property, typed),
 * and the result of the tool execution (`result` property, typed).
 *
 * @see {@link generateToolCall}
 * @see {@link executeTool}
 */
export async function useTool<
  PROMPT,
  // Using 'any' is required to allow for flexibility in the inputs. The actual types are
  // retrieved through lookups such as TOOL["name"], such that any does not affect any client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOOL extends Tool<any, any, any>,
>(
  model: ToolCallGenerationModel<PROMPT, ToolCallGenerationModelSettings>,
  tool: TOOL,
  prompt: PROMPT | ((tool: TOOL) => PROMPT),
  options?: FunctionOptions
): Promise<
  ToolResult<
    TOOL["name"],
    TOOL["parameters"],
    Awaited<ReturnType<TOOL["execute"]>>
  >
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tool: TOOL) => PROMPT)(tool)
      : prompt;

  return executeFunctionCall({
    options,
    input: expandedPrompt,
    functionType: "use-tool",
    execute: async (options) => {
      const toolCall = await generateToolCall<
        TOOL["parameters"],
        PROMPT,
        TOOL["name"],
        ToolCallGenerationModelSettings
      >(model, tool, expandedPrompt, {
        ...options,
      });

      return {
        tool: toolCall.name,
        toolCall,
        args: toolCall.args,
        result: await executeTool(tool, toolCall.args, options),
      };
    },
  });
}
