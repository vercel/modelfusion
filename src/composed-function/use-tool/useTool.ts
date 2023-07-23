import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  GenerateJsonModel,
  GenerateJsonModelSettings,
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
  prompt: (tool: TOOL) => PROMPT & GenerateJsonOrTextPrompt<RESPONSE>,
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

// { n: OUTPUT, ... }
type ToTypedOutputMap<T> = {
  [K in keyof T]: T[K] extends Tool<any, any, infer U> ? U : never;
};

// { tool: "n", result: OUTPUT } | ...
type ToToolNameResultPair<T> = {
  [KEY in keyof T]: { tool: KEY; result: T[KEY] };
}[keyof T];

type ToOutputValue<TOOLS extends ToolArray<Tool<any, any, any>[]>> =
  ToToolNameResultPair<ToTypedOutputMap<ToToolMap<TOOLS>>>;

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
): Promise<{ tool: null; result: string } | ToOutputValue<TOOLS>> {
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

  if (modelResponse.schema == null) {
    return {
      tool: null,
      result: modelResponse.value,
    };
  }

  const schema = modelResponse.schema as keyof TOOLS;
  const tool = tools.find((tool) => tool.name === schema);

  if (tool == null) {
    throw new NoSuchToolError(schema.toString());
  }

  const result = await tool.execute(modelResponse.value);

  return {
    tool: schema,
    result,
  };
}
