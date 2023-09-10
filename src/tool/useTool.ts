import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "../model-function/generate-structure/StructureGenerationModel.js";
import { generateStructure } from "../model-function/generate-structure/generateStructure.js";
import { Tool } from "./Tool.js";
import { executeTool } from "./executeTool.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `useTool` uses `generateJson` to generate parameters for a tool and then executes the tool with the parameters.
 *
 * @returns The result contains the name of the tool (`tool` property),
 * the parameters (`parameters` property, typed),
 * and the result of the tool execution (`result` property, typed).
 */
export async function useTool<
  PROMPT,
  RESPONSE,
  SETTINGS extends StructureGenerationModelSettings,
  TOOL extends Tool<any, any, any>,
>(
  model: StructureGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tool: TOOL,
  prompt: (tool: TOOL) => PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): Promise<{
  tool: TOOL["name"];
  parameters: TOOL["inputSchema"];
  result: Awaited<ReturnType<TOOL["execute"]>>;
}> {
  const { output: value } = await generateStructure<
    TOOL["inputSchema"],
    PROMPT,
    RESPONSE,
    TOOL["name"],
    SETTINGS
  >(
    model,
    {
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    },
    () => prompt(tool),
    options
  ).asFullResponse();

  return {
    tool: tool.name,
    parameters: value,
    result: await executeTool(tool, value, options),
  };
}
