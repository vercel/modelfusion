import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";

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
 *   new OpenAICompletionModel(...),
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
  options?: FunctionOptions & { returnType?: "text" }
): Promise<string>;
export async function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options: FunctionOptions & { returnType: "full" }
): Promise<{ value: string; response: unknown; metadata: ModelCallMetadata }>;
export async function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & { returnType?: "text" | "full" }
): Promise<
  string | { value: string; response: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
    functionType: "generate-text",
    input: prompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateText(prompt, options);
      const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;

      return {
        response: result.response,
        extractedValue: shouldTrimWhitespace ? result.text.trim() : result.text,
        usage: result.usage,
      };
    },
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
