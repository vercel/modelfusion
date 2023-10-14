import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
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
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export function generateText<PROMPT>(
  model: TextGenerationModel<PROMPT, TextGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions
): ModelFunctionPromise<string> {
  return new ModelFunctionPromise(
    executeCall({
      functionType: "text-generation",
      input: prompt,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doGenerateText(prompt, options);
        const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;

        return {
          response: result.response,
          extractedValue: shouldTrimWhitespace
            ? result.text.trim()
            : result.text,
          usage: result.usage,
        };
      },
    })
  );
}
