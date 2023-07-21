import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "../../model-function/generate-json/JsonGenerationModel.js";
import {
  generateJsonOrTextForSchemas,
  generateJsonForSchema,
} from "../../model-function/generate-json/generateJson.js";
import { Tool } from "./Tool.js";

export async function callTool<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  INPUT,
  OUTPUT
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tool: Tool<INPUT, OUTPUT>,
  prompt: (
    tool: Tool<INPUT, OUTPUT>
  ) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<OUTPUT> {
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

  return tool.run(input);
}

type ToolTransform<T> = {
  [K in keyof T]: T[K] extends Tool<infer U, any> ? U : never;
};

export async function callToolOrGenerateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  TOOLS extends Array<Tool<any, any>>
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tools: TOOLS,
  prompt: (tools: TOOLS) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
) {
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

  const result = await tool.run(modelResponse.value);

  return {
    tool: fnName,
    result: result as ToolTransform<TOOLS>[keyof TOOLS],
  };
}
