import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "../../model-function/generate-json/JsonGenerationModel.js";
import {
  generateJson,
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

type KeyValuePair<T> = { [K in keyof T]: { fnName: K; value: T[K] } }[keyof T];

export async function callToolOrGenerateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  TOOLS extends Record<string, Tool<any, any>>
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  tools: TOOLS,
  prompt: (
    tools: TOOLS
  ) => PROMPT &
    JsonGenerationPrompt<
      RESPONSE,
      { fnName: null; value: string } | KeyValuePair<ToolTransform<any>>
    >,
  options?: FunctionOptions<SETTINGS>
) {
  const expandedPrompt = prompt(tools);

  const modelResponse = await generateJson(model, expandedPrompt, options);

  if (modelResponse.fnName == null) {
    return {
      tool: null,
      result: modelResponse.value,
    };
  }

  const key = modelResponse.fnName as keyof TOOLS;
  const result = await tools[key].run(modelResponse.value);

  return {
    tool: key,
    result: result as ToolTransform<TOOLS>[keyof TOOLS],
  };
}
