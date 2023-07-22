import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  GenerateJsonModel,
  GenerateJsonModelSettings,
  GenerateJsonPrompt,
} from "./GenerateJsonModel.js";
import { SchemaDefinition } from "./SchemaDefinition.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

export function generateJson<
  STRUCTURE,
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonModelSettings
>(
  model: GenerateJsonModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinition: SchemaDefinition<any, STRUCTURE>,
  prompt: (
    schemaDefinition: SchemaDefinition<any, STRUCTURE>
  ) => PROMPT & GenerateJsonPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<STRUCTURE> {
  const expandedPrompt = prompt(schemaDefinition);

  return executeCall({
    model,
    options,
    callModel: (model, options) =>
      generateJson(model, schemaDefinition, prompt, options),
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response): STRUCTURE => {
      const json = expandedPrompt.extractJson(response);

      const parseResult = schemaDefinition.schema.safeParse(json);

      if (!parseResult.success) {
        throw new SchemaValidationError({
          schemaName: schemaDefinition.name,
          value: json,
          errors: parseResult.error,
        });
      }

      return parseResult.data;
    },
    getStartEvent: (metadata, settings) => ({
      type: "json-generation-started",
      metadata,
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "json-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "json-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "json-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      response,
      generatedJson: output,
    }),
  });
}
