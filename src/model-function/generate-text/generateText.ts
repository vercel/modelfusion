import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";

/**
 * Generates a text using a prompt.
 * The prompt format depends on the model.
 * For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
 *
 * @example
 * const model = new OpenAITextGenerationModel(...);
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export function generateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: TextGenerationModel<PROMPT, RESPONSE, any, SETTINGS>,
  prompt: PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TextGenerationModel<PROMPT, RESPONSE, any, SETTINGS>,
  string,
  RESPONSE
> {
  return executeCall({
    model,
    options,
    generateResponse: (options) => model.generateTextResponse(prompt, options),
    extractOutputValue: (result) => {
      const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;
      return shouldTrimWhitespace
        ? model.extractText(result).trim()
        : model.extractText(result);
    },
    getStartEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "text-generation",
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "text-generation",
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "text-generation",
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "text-generation",
      settings,
      prompt,
      response,
      generatedText: output,
    }),
  });
}
