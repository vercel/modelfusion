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
 * const text = await generateText({
 *   model: openai.CompletionTextGenerator(...),
 *   prompt: "Write a short story about a robot learning to love:\n\n"
 * });
 *
 * @param {TextGenerationModel<PROMPT, TextGenerationModelSettings>} model - The text generation model to use.
 * @param {PROMPT} prompt - The prompt to use for text generation.
 *
 * @returns {Promise<string>} - A promise that resolves to the generated text.
 */
export async function generateText<PROMPT>(
  args: {
    model: TextGenerationModel<PROMPT, TextGenerationModelSettings>;
    prompt: PROMPT;
    fullResponse?: false;
  } & FunctionOptions
): Promise<string>;
export async function generateText<PROMPT>(
  args: {
    model: TextGenerationModel<PROMPT, TextGenerationModelSettings>;
    prompt: PROMPT;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  text: string;
  finishReason: TextGenerationFinishReason;
  texts: string[];
  textGenerationResults: TextGenerationResult[];
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateText<PROMPT>({
  model,
  prompt,
  fullResponse,
  ...options
}: {
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>;
  prompt: PROMPT;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | string
  | {
      text: string;
      finishReason: TextGenerationFinishReason;
      texts: string[];
      textGenerationResults: TextGenerationResult[];
      rawResponse: unknown;
      metadata: ModelCallMetadata;
    }
> {
  const callResponse = await executeStandardCall({
    functionType: "generate-text",
    input: prompt,
    model,
    options,
    generateResponse: async (options) => {
      async function getGeneratedTexts() {
        if (options?.cache == null) {
          return {
            ...(await model.doGenerateTexts(prompt, options)),
            cache: undefined,
          };
        }

        let cacheErrors: unknown[] | undefined = undefined;

        const cacheKey = {
          functionType: "generate-text",
          functionId: options?.functionId,
          input: {
            model,
            settings: model.settingsForEvent, // TODO should include full model information
            prompt,
          },
        };

        try {
          const cachedRawResponse = await options.cache.lookupValue(cacheKey);

          if (cachedRawResponse != null) {
            return {
              ...model.restoreGeneratedTexts(cachedRawResponse),
              cache: { status: "hit" },
            };
          }
        } catch (err) {
          cacheErrors = [err];
        }

        const result = await model.doGenerateTexts(prompt, options);

        try {
          await options.cache.storeValue(cacheKey, result.rawResponse);
        } catch (err) {
          cacheErrors = [...(cacheErrors ?? []), err];
        }

        return {
          ...result,
          cache: { status: "miss", errors: cacheErrors },
        };
      }

      const result = await getGeneratedTexts();

      const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;

      const textGenerationResults = shouldTrimWhitespace
        ? result.textGenerationResults.map((textGeneration) => ({
            text: textGeneration.text.trim(),
            finishReason: textGeneration.finishReason,
          }))
        : result.textGenerationResults;

      // TODO add cache information
      return {
        rawResponse: result.rawResponse,
        extractedValue: textGenerationResults,
        usage: result.usage,
      };
    },
  });

  const textGenerationResults = callResponse.value;
  const firstResult = textGenerationResults[0];

  return fullResponse
    ? {
        text: firstResult.text,
        finishReason: firstResult.finishReason,
        texts: textGenerationResults.map(
          (textGeneration) => textGeneration.text
        ),
        textGenerationResults,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : firstResult.text;
}
