import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { executeCall } from "../executeCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import { NoSuchStructureError } from "./NoSuchStructureError.js";
import {
  StructureOrTextGenerationModel,
  StructureOrTextGenerationModelSettings,
} from "./StructureOrTextGenerationModel.js";
import { StructureValidationError } from "./StructureValidationError.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

// [ { name: "n", structure: z.object<STRUCTURE> } | { ... } ]
type StructureDefinitionArray<T extends StructureDefinition<any, any>[]> = T;

// { n: { name: "n", structure: z.object<STRUCTURE> }, ... }
type ToStructureDefinitionMap<
  T extends StructureDefinitionArray<StructureDefinition<any, any>[]>,
> = {
  [K in T[number]["name"]]: Extract<T[number], StructureDefinition<K, any>>;
};

// { structure: "n", value: STRUCTURE } | ...
type ToStructureUnion<T> = {
  [KEY in keyof T]: T[KEY] extends StructureDefinition<any, infer STRUCTURE>
    ? { structure: KEY; value: STRUCTURE; text: string | null }
    : never;
}[keyof T];

type ToOutputValue<
  STRUCTURES extends StructureDefinitionArray<StructureDefinition<any, any>[]>,
> = ToStructureUnion<ToStructureDefinitionMap<STRUCTURES>>;

export function generateStructureOrText<
  STRUCTURES extends StructureDefinition<any, any>[],
  PROMPT,
>(
  model: StructureOrTextGenerationModel<
    PROMPT,
    StructureOrTextGenerationModelSettings
  >,
  structureDefinitions: STRUCTURES,
  prompt: PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT),
  options?: FunctionOptions
): ModelFunctionPromise<
  { structure: null; value: null; text: string } | ToOutputValue<STRUCTURES>
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (structures: STRUCTURES) => PROMPT)(structureDefinitions)
      : prompt;

  return new ModelFunctionPromise(
    executeCall({
      functionType: "structure-or-text-generation",
      input: expandedPrompt,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doGenerateStructureOrText(
          structureDefinitions,
          expandedPrompt,
          options
        );

        const { structure, value, text } = result.structureAndText;

        // text generation:
        if (structure == null) {
          return {
            response: result.response,
            extractedValue: { structure, value, text },
            usage: result.usage,
          };
        }

        const definition = structureDefinitions.find(
          (d) => d.name === structure
        );

        if (definition == undefined) {
          throw new NoSuchStructureError(structure);
        }

        const parseResult = definition.schema.validate(value);

        if (!parseResult.success) {
          throw new StructureValidationError({
            structureName: structure,
            value,
            valueText: result.structureAndText.valueText,
            cause: parseResult.error,
          });
        }

        return {
          response: result.response,
          extractedValue: {
            structure: structure as ToOutputValue<STRUCTURES>["structure"],
            value: parseResult.data,
            text: text as any, // text is string | null, which is part of the response for schema values
          },
          usage: result.usage,
        };
      },
    })
  );
}
