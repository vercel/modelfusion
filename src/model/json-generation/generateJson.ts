import { PromptTemplate } from "../../run/PromptTemplate.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationSchema,
} from "./JsonGenerationModel.js";

export function generateJson<
  T,
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT,
  schema: JsonGenerationSchema<T>,
  options?: FunctionOptions<SETTINGS>
): Promise<T> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => generateJson(model, prompt, schema, options),
    generateResponse: (options) =>
      model.generateJsonResponse(prompt, schema, options),
    extractOutputValue: (response) => model.extractJson(response, schema),
    getStartEvent: (metadata, settings) => ({
      type: "json-generation-started",
      metadata,
      settings,
      prompt,
      schema,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "json-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
      schema,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "json-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      schema,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "json-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      schema,
      response,
      generatedJson: output,
    }),
  });
}

export function generateJsonAsFunction<
  INPUT,
  T,
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  promptTemplate: PromptTemplate<INPUT, PROMPT>,
  schema: JsonGenerationSchema<T>,
  generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
) {
  return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
    const expandedPrompt = await promptTemplate(input);
    return generateJson(model, expandedPrompt, schema, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
