import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "../../model-function/generate-json/JsonGenerationModel.js";
import {
  generateJsonForSchema,
  generateJsonOrTextForSchemas,
} from "../../model-function/generate-json/generateJson.js";
import { Tool } from "./Tool.js";

export async function callTool<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  TOOL extends Tool<any, any, any>
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tool: TOOL,
  prompt: (tool: TOOL) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<Awaited<ReturnType<TOOL["execute"]>>> {
  const input = await generateJsonForSchema(
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

export async function callToolOrGenerateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  TOOLS extends Array<Tool<any, any, any>>
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tools: TOOLS,
  prompt: (tools: TOOLS) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<{ tool: null; result: string } | ToOutputValue<TOOLS>> {
  const expandedPrompt = prompt(tools);

  const modelResponse = await generateJsonOrTextForSchemas(
    model,
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    })),
    () => expandedPrompt,
    options
  );

  if (modelResponse.fnName == null) {
    return {
      tool: null,
      result: modelResponse.value,
    };
  }

  const fnName = modelResponse.fnName as keyof TOOLS;
  const tool = tools.find((tool) => tool.name === fnName);

  if (tool == null) {
    throw new Error(`Tool not found: ${fnName.toString()}`);
  }

  const result = await tool.execute(modelResponse.value);

  return {
    tool: fnName,
    result,
  };
}
