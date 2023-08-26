import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  GenerateJsonModel,
  GenerateJsonModelSettings,
} from "./GenerateJsonModel.js";
import { SchemaDefinition } from "./SchemaDefinition.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

export function generateJson<
  STRUCTURE,
  PROMPT,
  RESPONSE,
  NAME extends string,
  SETTINGS extends GenerateJsonModelSettings,
>(
  model: GenerateJsonModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinition: SchemaDefinition<NAME, STRUCTURE>,
  prompt: (schemaDefinition: SchemaDefinition<NAME, STRUCTURE>) => PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  GenerateJsonModel<PROMPT, RESPONSE, SETTINGS>,
  STRUCTURE,
  RESPONSE
> {
  const expandedPrompt = prompt(schemaDefinition);

  return executeCall({
    model,
    options,
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response): STRUCTURE => {
      const json = model.extractJson(response);

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
      ...metadata,
      functionType: "json-generation",
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "json-generation",
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "json-generation",
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "json-generation",
      settings,
      prompt,
      response,
      generatedJson: output,
    }),
  });
}
