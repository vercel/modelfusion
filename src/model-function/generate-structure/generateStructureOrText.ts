import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  StructureOrTextGenerationModel,
  StructureOrTextGenerationModelSettings,
} from "./StructureOrTextGenerationModel.js";
import { NoSuchStructureError } from "./NoSuchStructureError.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
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
  RESPONSE,
  SETTINGS extends StructureOrTextGenerationModelSettings,
>(
  model: StructureOrTextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  structureDefinitions: STRUCTURES,
  prompt: PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT),
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  { structure: null; value: null; text: string } | ToOutputValue<STRUCTURES>,
  RESPONSE
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (structures: STRUCTURES) => PROMPT)(structureDefinitions)
      : prompt;

  return executeCall({
    functionType: "structure-or-text-generation",
    input: expandedPrompt,
    model,
    options,
    generateResponse: (options) =>
      model.generateStructureOrTextResponse(
        structureDefinitions,
        expandedPrompt,
        options
      ),
    extractOutputValue: (
      response
    ):
      | { structure: null; value: null; text: string }
      | ToOutputValue<STRUCTURES> => {
      const { structure, value, text } =
        model.extractStructureAndText(response);

      // text generation:
      if (structure == null) {
        return { structure, value, text };
      }

      const definition = structureDefinitions.find((d) => d.name === structure);

      if (definition == undefined) {
        throw new NoSuchStructureError(structure);
      }

      const parseResult = definition.schema.validate(value);

      if (!parseResult.success) {
        throw new StructureValidationError({
          structureName: structure,
          value,
          cause: parseResult.error,
        });
      }

      return {
        structure: structure as ToOutputValue<STRUCTURES>["structure"],
        value: parseResult.value,
        text: text as any, // text is string | null, which is part of the response for schema values
      };
    },
    extractUsage: (result) => model.extractUsage?.(result),
  });
}
