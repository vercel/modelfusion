import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  StructureOrTextGenerationModel,
  StructureOrTextGenerationModelSettings,
} from "../model-function/generate-structure/StructureOrTextGenerationModel.js";
import { generateStructureOrText } from "../model-function/generate-structure/generateStructureOrText.js";
import { NoSuchToolError } from "./NoSuchToolError.js";
import { Tool } from "./Tool.js";
import { executeTool } from "./executeTool.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

// [ { name: "n", ... } | { ... } ]
type ToolArray<T extends Tool<any, any, any>[]> = T;

// { n: { name: "n", ... }, ... }
type ToToolMap<T extends ToolArray<Tool<any, any, any>[]>> = {
  [K in T[number]["name"]]: Extract<T[number], Tool<K, any, any>>;
};

// { tool: "n", result: ... } | { ... }
type ToToolUnion<T> = {
  [KEY in keyof T]: T[KEY] extends Tool<any, infer INPUT, infer OUTPUT>
    ? { tool: KEY; parameters: INPUT; result: OUTPUT; text: string | null }
    : never;
}[keyof T];

type ToOutputValue<TOOLS extends ToolArray<Tool<any, any, any>[]>> =
  ToToolUnion<ToToolMap<TOOLS>>;

export async function useToolOrGenerateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends StructureOrTextGenerationModelSettings,
  TOOLS extends Array<Tool<any, any, any>>,
>(
  model: StructureOrTextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tools: TOOLS,
  prompt: PROMPT | ((tools: TOOLS) => PROMPT),
  options?: ModelFunctionOptions<SETTINGS>
): Promise<
  | { tool: null; parameters: null; result: null; text: string }
  | ToOutputValue<TOOLS>
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tools: TOOLS) => PROMPT)(tools)
      : prompt;

  const modelResponse = await generateStructureOrText(
    model,
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    })),
    expandedPrompt,
    options
  );

  const { structure, text } = modelResponse;

  if (structure == null) {
    return {
      tool: null,
      parameters: null,
      result: null,
      text,
    };
  }

  const tool = tools.find((tool) => tool.name === structure);

  if (tool == null) {
    throw new NoSuchToolError(structure.toString());
  }

  const toolParameters = modelResponse.value;

  const result = await executeTool(tool, toolParameters, options);

  return {
    tool: structure as keyof ToToolMap<TOOLS>,
    result,
    parameters: toolParameters,
    text: text as any, // string | null is the expected value here
  };
}
