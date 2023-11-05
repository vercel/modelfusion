import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
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

/**
 * Generates a typed object or plain text based on the given prompt and structure definitions.
 * The structure definition is used as part of the final prompt.
 *
 * This function interacts with a specified model to either return a structured object conforming to one of the provided
 * structure definitions or a plain text response if the model decides not to return a structured object.
 *
 * For the OpenAI chat model, this generates and parses a function call with automatic function selection.
 *
 * @see https://modelfusion.dev/guide/function/generate-structure-or-text
 *
 * @example
 * const { structure, value, text } = await generateStructureOrText(
 *   new OpenAIChatModel(...),
 *   [
 *     new ZodStructureDefinition({
 *       name: "getCurrentWeather" as const, // mark 'as const' for type inference
 *       description: "Get the current weather in a given location",
 *       schema: z.object({
 *         location: z
 *           .string()
 *           .describe("The city and state, e.g. San Francisco, CA"),
 *         unit: z.enum(["celsius", "fahrenheit"]).optional(),
 *       }),
 *     }),
 *     new ZodStructureDefinition({
 *       name: "getContactInformation" as const,
 *       description: "Get the contact information for a given person",
 *       schema: z.object({
 *         name: z.string().describe("The name of the person"),
 *       }),
 *     }),
 *   ],
 *   [OpenAIChatMessage.user(query)]
 * );
 *
 * switch (structure) {
 *   case "getCurrentWeather": {
 *     const { location, unit } = value;
 *     console.log("getCurrentWeather", location, unit);
 *     break;
 *   }
 *
 *   case "getContactInformation": {
 *     const { name } = value;
 *     console.log("getContactInformation", name);
 *     break;
 *   }
 *
 *   case null: {
 *     console.log("No function call. Generated text: ", text);
 *   }
 * }
 *
 * @param {StructureOrTextGenerationModel<PROMPT, SETTINGS>} model - The model responsible for generating structured data or text.
 * @param {STRUCTURES} structureDefinitions - An array of StructureDefinition instances defining the possible structures of the expected response.
 * @param {PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT)} prompt - The prompt used to generate the structure or text.
 * You can also pass a function that takes the array of structure definitions as an argument and returns the prompt.
 * @param {FunctionOptions} [options] - Additional options to control the function's execution behavior.
 *
 * @returns {Promise<{ structure: null; value: null; text: string } | ToOutputValue<STRUCTURES>>} - Returns a promise that resolves to an object containing either a structured response conforming to one of the provided definitions or a plain text response.
 */
export async function generateStructureOrText<
  STRUCTURES extends StructureDefinition<any, any>[],
  PROMPT,
>(
  model: StructureOrTextGenerationModel<
    PROMPT,
    StructureOrTextGenerationModelSettings
  >,
  structureDefinitions: STRUCTURES,
  prompt: PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT),
  options?: FunctionOptions & { fullResponse?: false }
): Promise<
  { structure: null; value: null; text: string } | ToOutputValue<STRUCTURES>
>;
export async function generateStructureOrText<
  STRUCTURES extends StructureDefinition<any, any>[],
  PROMPT,
>(
  model: StructureOrTextGenerationModel<
    PROMPT,
    StructureOrTextGenerationModelSettings
  >,
  structureDefinitions: STRUCTURES,
  prompt: PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT),
  options: FunctionOptions & { fullResponse: true }
): Promise<{
  value:
    | { structure: null; value: null; text: string }
    | ToOutputValue<STRUCTURES>;
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateStructureOrText<
  STRUCTURES extends StructureDefinition<any, any>[],
  PROMPT,
>(
  model: StructureOrTextGenerationModel<
    PROMPT,
    StructureOrTextGenerationModelSettings
  >,
  structureDefinitions: STRUCTURES,
  prompt: PROMPT | ((structureDefinitions: STRUCTURES) => PROMPT),
  options?: FunctionOptions & { fullResponse?: boolean }
): Promise<
  | { structure: null; value: null; text: string }
  | ToOutputValue<STRUCTURES>
  | {
      value:
        | { structure: null; value: null; text: string }
        | ToOutputValue<STRUCTURES>;
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (structures: STRUCTURES) => PROMPT)(structureDefinitions)
      : prompt;

  const fullResponse = await executeStandardCall({
    functionType: "generate-structure-or-text",
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

      const definition = structureDefinitions.find((d) => d.name === structure);

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
  });

  return options?.fullResponse ? fullResponse : fullResponse.value;
}
