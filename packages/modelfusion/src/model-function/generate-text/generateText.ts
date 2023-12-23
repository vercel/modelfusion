import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import {
  TextGenerationFinishReason,
  TextGenerationResult,
} from "./TextGenerationResult.js";

/**
 * Generate text for a prompt and return it as a string.
 *
 * The prompt depends on the model used.
 * For instance, OpenAI completion models expect a string prompt,
 * whereas OpenAI chat models expect an array of chat messages.
 *
 * @see https://modelfusion.dev/guide/function/generate-text
 *
 * @example
 * const text = await generateText(
 *   openai.CompletionTextGenerator(...),
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 *
 * @param {TextGenerationModel<PROMPT, TextGenerationModelSettings>} model - The text generation model to use.
 * @param {PROMPT} prompt - The prompt to use for text generation.
 * @param {FunctionOptions} [options] - Optional parameters for the function.
 *
 * @returns {Promise<string>} - A promise that resolves to the generated text.
 */
export async function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & { fullResponse?: false }
): Promise<string>;
export async function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options: FunctionOptions & { fullResponse: true }
): Promise<{
  text: string;
  finishReason: TextGenerationFinishReason;
  texts: string[];
  textGenerationResults: TextGenerationResult[];
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & { fullResponse?: boolean }
): Promise<
  | string
  | {
      text: string;
      finishReason: TextGenerationFinishReason;
      texts: string[];
      textGenerationResults: TextGenerationResult[];
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  const fullResponse = await executeStandardCall({
    functionType: "generate-text",
    input: prompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateTexts(prompt, options);
      const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;

      const textGenerationResults = shouldTrimWhitespace
        ? result.textGenerationResults.map((textGeneration) => ({
            text: textGeneration.text.trim(),
            finishReason: textGeneration.finishReason,
          }))
        : result.textGenerationResults;

      return {
        response: result.response,
        extractedValue: textGenerationResults,
        usage: result.usage,
      };
    },
  });

  const textGenerationResults = fullResponse.value;
  const firstResult = textGenerationResults[0];

  return options?.fullResponse
    ? {
        text: firstResult.text,
        finishReason: firstResult.finishReason,
        texts: textGenerationResults.map(
          (textGeneration) => textGeneration.text
        ),
        textGenerationResults,
        response: fullResponse.response,
        metadata: fullResponse.metadata,
      }
    : firstResult.text;
}
