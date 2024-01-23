import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  ObjectGenerationModel,
  ObjectGenerationModelSettings,
} from "./ObjectGenerationModel.js";
import { ObjectValidationError } from "./ObjectValidationError.js";

/**
 * Generate a typed object for a prompt and a schema.
 *
 * @see https://modelfusion.dev/guide/function/generate-object
 *
 * @example
 * const sentiment = await generateObject({
 *   model: openai.ChatTextGenerator(...).asFunctionCallObjectGenerationModel(...),
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
 * @param {ObjectGenerationModel<PROMPT, SETTINGS>} options.model - The model to generate the object.
 * @param {Schema<OBJECT>} options.schema - The schema to be used.
 * @param {PROMPT | ((schema: Schema<OBJECT>) => PROMPT)} options.prompt
 * The prompt to be used.
 * You can also pass a function that takes the schema as an argument and returns the prompt.
 *
 * @returns {Promise<OBJECT>} - Returns a promise that resolves to the generated object.
 */
export async function generateObject<
  OBJECT,
  PROMPT,
  SETTINGS extends ObjectGenerationModelSettings,
>(
  args: {
    model: ObjectGenerationModel<PROMPT, SETTINGS>;
    schema: Schema<OBJECT> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<OBJECT>) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<OBJECT>;
export async function generateObject<
  OBJECT,
  PROMPT,
  SETTINGS extends ObjectGenerationModelSettings,
>(
  args: {
    model: ObjectGenerationModel<PROMPT, SETTINGS>;
    schema: Schema<OBJECT> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<OBJECT>) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  value: OBJECT;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateObject<
  OBJECT,
  PROMPT,
  SETTINGS extends ObjectGenerationModelSettings,
>({
  model,
  schema,
  prompt,
  fullResponse,
  ...options
}: {
  model: ObjectGenerationModel<PROMPT, SETTINGS>;
  schema: Schema<OBJECT> & JsonSchemaProducer;
  prompt: PROMPT | ((schema: Schema<OBJECT>) => PROMPT);
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | OBJECT
  | {
      value: OBJECT;
      rawResponse: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (schema: Schema<OBJECT>) => PROMPT)(schema)
      : prompt;

  const callResponse = await executeStandardCall({
    functionType: "generate-object",
    input: {
      schema,
      prompt: expandedPrompt,
    },
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateObject(
        schema,
        expandedPrompt,
        options
      );

      const parseResult = schema.validate(result.value);

      if (!parseResult.success) {
        throw new ObjectValidationError({
          valueText: result.valueText,
          value: result.value,
          cause: parseResult.error,
        });
      }

      const value = parseResult.value;

      return {
        rawResponse: result.rawResponse,
        extractedValue: value,
        usage: result.usage,
      };
    },
  });

  return fullResponse
    ? {
        value: callResponse.value,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
