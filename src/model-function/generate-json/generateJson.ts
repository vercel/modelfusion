import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
} from "./JsonGenerationModel.js";
import { StructureDefinition } from "./StructureDefinition.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

export function generateJson<
  STRUCTURE,
  PROMPT,
  RESPONSE,
  NAME extends string,
  SETTINGS extends JsonGenerationModelSettings,
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt: (schemaDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<STRUCTURE, RESPONSE> {
  const expandedPrompt = prompt(schemaDefinition);

  return executeCall({
    functionType: "json-generation",
    input: expandedPrompt,
    model,
    options,
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response): STRUCTURE => {
      const json = model.extractJson(response);

      const parseResult = schemaDefinition.schema.validate(json);

      if (!parseResult.success) {
        throw new SchemaValidationError({
          schemaName: schemaDefinition.name,
          value: json,
          cause: parseResult.error,
        });
      }

      return parseResult.value;
    },
    extractUsage: (result) => model.extractUsage?.(result),
  });
}
