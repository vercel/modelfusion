import { FunctionOptions } from "../core/FunctionOptions.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "../model-function/generate-structure/StructureGenerationModel.js";
import { generateStructure } from "../model-function/generate-structure/generateStructure.js";
import { Tool } from "./Tool.js";
import { executeTool } from "./executeTool.js";

/**
 * `useTool` uses `generateStructure` to generate parameters for a tool and then executes the tool with the parameters.
 *
 * @returns The result contains the name of the tool (`tool` property),
 * the parameters (`parameters` property, typed),
 * and the result of the tool execution (`result` property, typed).
 */
export async function useTool<
  PROMPT,
  // Using 'any' is required to allow for flexibility in the inputs. The actual types are
  // retrieved through lookups such as TOOL["name"], such that any does not affect any client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOOL extends Tool<any, any, any>,
>(
  model: StructureGenerationModel<PROMPT, StructureGenerationModelSettings>,
  tool: TOOL,
  prompt: PROMPT | ((tool: TOOL) => PROMPT),
  options?: FunctionOptions
): Promise<{
  tool: TOOL["name"];
  parameters: TOOL["inputSchema"];
  result: Awaited<ReturnType<TOOL["execute"]>>;
}> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tool: TOOL) => PROMPT)(tool)
      : prompt;

  const { value } = await generateStructure<
    TOOL["inputSchema"],
    PROMPT,
    TOOL["name"],
    StructureGenerationModelSettings
  >(
    model,
    {
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    },
    expandedPrompt,
    options
  ).asFullResponse();

  return {
    tool: tool.name,
    parameters: value,
    result: await executeTool(tool, value, options),
  };
}
