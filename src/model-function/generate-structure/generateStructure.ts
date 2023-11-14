import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/schema/StructureDefinition.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "./StructureGenerationModel.js";
import { StructureValidationError } from "./StructureValidationError.js";

/**
 * Generate a typed object for a prompt and a structure definition.
 * The structure definition is used as part of the final prompt.
 *
 * For the OpenAI chat model, this generates and parses a function call with a single function.
 *
 * @see https://modelfusion.dev/guide/function/generate-structure
 *
 * @example
 * const sentiment = await generateStructure(
 *   new OpenAIChatModel(...),
 *   new ZodStructureDefinition({
 *     name: "sentiment",
 *     description: "Write the sentiment analysis",
 *     schema: z.object({
 *       sentiment: z
 *         .enum(["positive", "neutral", "negative"])
 *         .describe("Sentiment."),
 *     }),
 *   }),
 *   [
 *     OpenAIChatMessage.system(
 *       "You are a sentiment evaluator. " +
 *         "Analyze the sentiment of the following product review:"
 *     ),
 *     OpenAIChatMessage.user(
 *       "After I opened the package, I was met by a very unpleasant smell " +
 *         "that did not disappear even after washing. Never again!"
 *     ),
 *   ]
 * );
 *
 * @param {StructureGenerationModel<PROMPT, SETTINGS>} model - The model to generate the structure.
 * @param {StructureDefinition<NAME, STRUCTURE>} structureDefinition - The structure definition to be used.
 * @param {PROMPT | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT)} prompt
 * The prompt to be used.
 * You can also pass a function that takes the structure definition as an argument and returns the prompt.
 * @param {FunctionOptions} [options] - Optional function options.
 *
 * @returns {Promise<STRUCTURE>} - Returns a promise that resolves to the generated structure.
 */
export async function generateStructure<
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
  options?: FunctionOptions & { returnType?: "structure" }
): Promise<STRUCTURE>;
export async function generateStructure<
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
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: STRUCTURE;
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateStructure<
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
  options?: FunctionOptions & { returnType?: "structure" | "full" }
): Promise<
  | STRUCTURE
  | { value: STRUCTURE; response: unknown; metadata: ModelCallMetadata }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (
          prompt as (
            structureDefinition: StructureDefinition<NAME, STRUCTURE>
          ) => PROMPT
        )(structureDefinition)
      : prompt;

  const fullResponse = await executeStandardCall({
    functionType: "generate-structure",
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

      const value = parseResult.data;

      return {
        response: result.response,
        extractedValue: value,
        usage: result.usage,
      };
    },
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
