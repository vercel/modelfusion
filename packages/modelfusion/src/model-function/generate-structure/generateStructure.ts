import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "./StructureGenerationModel.js";
import { StructureValidationError } from "./StructureValidationError.js";

/**
 * Generate a typed object for a prompt and a schema.
 *
 * @see https://modelfusion.dev/guide/function/generate-structure
 *
 * @example
 * const sentiment = await generateStructure({
 *   model: openai.ChatTextGenerator(...).asFunctionCallStructureGenerationModel(...),
 *
 *   schema: zodSchema(z.object({
 *     sentiment: z
 *       .enum(["positive", "neutral", "negative"])
 *       .describe("Sentiment."),
 *   })),
 *
 *   prompt: [
 *     openai.ChatMessage.system(
 *       "You are a sentiment evaluator. " +
 *         "Analyze the sentiment of the following product review:"
 *     ),
 *     openai.ChatMessage.user(
 *       "After I opened the package, I was met by a very unpleasant smell " +
 *         "that did not disappear even after washing. Never again!"
 *     ),
 *   ]
 * });
 *
 * @param {StructureGenerationModel<PROMPT, SETTINGS>} model - The model to generate the structure.
 * @param {Schema<STRUCTURE>} schema - The schema to be used.
 * @param {PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT)} prompt
 * The prompt to be used.
 * You can also pass a function that takes the schema as an argument and returns the prompt.
 *
 * @returns {Promise<STRUCTURE>} - Returns a promise that resolves to the generated structure.
 */
export async function generateStructure<
  STRUCTURE,
  PROMPT,
  SETTINGS extends StructureGenerationModelSettings,
>(
  args: {
    model: StructureGenerationModel<PROMPT, SETTINGS>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<STRUCTURE>;
export async function generateStructure<
  STRUCTURE,
  PROMPT,
  SETTINGS extends StructureGenerationModelSettings,
>(
  args: {
    model: StructureGenerationModel<PROMPT, SETTINGS>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  structure: STRUCTURE;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateStructure<
  STRUCTURE,
  PROMPT,
  SETTINGS extends StructureGenerationModelSettings,
>({
  model,
  schema,
  prompt,
  fullResponse,
  ...options
}: {
  model: StructureGenerationModel<PROMPT, SETTINGS>;
  schema: Schema<STRUCTURE> & JsonSchemaProducer;
  prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | STRUCTURE
  | {
      structure: STRUCTURE;
      rawResponse: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (schema: Schema<STRUCTURE>) => PROMPT)(schema)
      : prompt;

  const callResponse = await executeStandardCall({
    functionType: "generate-structure",
    input: {
      schema,
      prompt: expandedPrompt,
    },
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateStructure(
        schema,
        expandedPrompt,
        options
      );

      const structure = result.value;
      const parseResult = schema.validate(structure);

      if (!parseResult.success) {
        throw new StructureValidationError({
          valueText: result.valueText,
          value: structure,
          cause: parseResult.error,
        });
      }

      const value = parseResult.data;

      return {
        rawResponse: result.rawResponse,
        extractedValue: value,
        usage: result.usage,
      };
    },
  });

  return fullResponse
    ? {
        structure: callResponse.value,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
