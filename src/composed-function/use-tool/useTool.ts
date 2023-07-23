import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  GenerateJsonModel,
  GenerateJsonModelSettings,
  GenerateJsonPrompt,
} from "../../model-function/generate-json/GenerateJsonModel.js";
import {
  GenerateJsonOrTextModel,
  GenerateJsonOrTextModelSettings,
  GenerateJsonOrTextPrompt,
} from "../../model-function/generate-json/GenerateJsonOrTextModel.js";
import { generateJson } from "../../model-function/generate-json/generateJson.js";
import { generateJsonOrText } from "../../model-function/generate-json/generateJsonOrText.js";
import { NoSuchToolError } from "./NoSuchToolError.js";
import { Tool } from "./Tool.js";

export async function useTool<
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonModelSettings,
  TOOL extends Tool<any, any, any>
>(
  model: GenerateJsonModel<PROMPT, RESPONSE, SETTINGS>,
  tool: TOOL,
  prompt: (tool: TOOL) => PROMPT & GenerateJsonPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<Awaited<ReturnType<TOOL["execute"]>>> {
  const input = await generateJson(
    model,
    {
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    },
    () => prompt(tool),
    options
  );

  return tool.execute(input);
}

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
  SETTINGS extends GenerateJsonOrTextModelSettings,
  TOOLS extends Array<Tool<any, any, any>>
>(
  model: GenerateJsonOrTextModel<PROMPT, RESPONSE, SETTINGS>,
  tools: TOOLS,
  prompt: (tools: TOOLS) => PROMPT & GenerateJsonOrTextPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<
  | { tool: null; parameters: null; result: null; text: string }
  | ToOutputValue<TOOLS>
> {
  const expandedPrompt = prompt(tools);

  const modelResponse = await generateJsonOrText(
    model,
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    })),
    () => expandedPrompt,
    options
  );

  const { schema, text } = modelResponse;

  if (schema == null) {
    return {
      tool: null,
      parameters: null,
      result: null,
      text,
    };
  }

  const tool = tools.find((tool) => tool.name === schema);

  if (tool == null) {
    throw new NoSuchToolError(schema.toString());
  }

  const toolParameters = modelResponse.value;

  const result = await tool.execute(toolParameters);

  return {
    tool: schema as keyof ToToolMap<TOOLS>,
    result,
    parameters: toolParameters,
    text: text as any, // string | null is the expected value here
  };
}
