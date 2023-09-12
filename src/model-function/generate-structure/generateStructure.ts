import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "./StructureGenerationModel.js";
import { StructureValidationError } from "./StructureValidationError.js";

export function generateStructure<
  STRUCTURE,
  PROMPT,
  RESPONSE,
  NAME extends string,
  SETTINGS extends StructureGenerationModelSettings,
>(
  model: StructureGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt:
    | PROMPT
    | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT),
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<STRUCTURE, RESPONSE> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (
          prompt as (
            structureDefinition: StructureDefinition<NAME, STRUCTURE>
          ) => PROMPT
        )(structureDefinition)
      : prompt;

  return executeCall({
    functionType: "structure-generation",
    input: expandedPrompt,
    model,
    options,
    generateResponse: (options) =>
      model.generateStructureResponse(
        structureDefinition,
        expandedPrompt,
        options
      ),
    extractOutputValue: (response): STRUCTURE => {
      const structure = model.extractStructure(response);

      const parseResult = structureDefinition.schema.validate(structure);

      if (!parseResult.success) {
        throw new StructureValidationError({
          structureName: structureDefinition.name,
          value: structure,
          cause: parseResult.error,
        });
      }

      return parseResult.value;
    },
    extractUsage: (result) => model.extractUsage?.(result),
  });
}
