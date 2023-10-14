import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { executeCall } from "../executeCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "./StructureGenerationModel.js";
import { StructureValidationError } from "./StructureValidationError.js";

export function generateStructure<
  STRUCTURE,
  PROMPT,
  NAME extends string,
  SETTINGS extends StructureGenerationModelSettings,
>(
  model: StructureGenerationModel<PROMPT, SETTINGS>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt:
    | PROMPT
    | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT),
  options?: FunctionOptions
): ModelFunctionPromise<STRUCTURE> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (
          prompt as (
            structureDefinition: StructureDefinition<NAME, STRUCTURE>
          ) => PROMPT
        )(structureDefinition)
      : prompt;

  return new ModelFunctionPromise(
    executeCall({
      functionType: "structure-generation",
      input: expandedPrompt,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doGenerateStructure(
          structureDefinition,
          expandedPrompt,
          options
        );

        const structure = result.value;
        const parseResult = structureDefinition.schema.validate(structure);

        if (!parseResult.success) {
          throw new StructureValidationError({
            structureName: structureDefinition.name,
            valueText: result.valueText,
            value: structure,
            cause: parseResult.error,
          });
        }

        const value = parseResult.value;

        return {
          response: result.response,
          extractedValue: value,
          usage: result.usage,
        };
      },
    })
  );
}
